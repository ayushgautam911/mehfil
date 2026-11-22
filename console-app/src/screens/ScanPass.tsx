import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { CHeader, Body, Panel, CBtn } from '../components/primitives';
import { api } from '../api';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanLog {
  id: string;
  timestamp: string;
  memberName: string;
  result: 'valid' | 'invalid' | 'already_scanned';
  message: string;
  eventName?: string;
}

export default function ScanPass() {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualPayload, setManualPayload] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Track mount state to avoid race conditions and unmounted state updates
  const isMounted = useRef<boolean>(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Manual next pass control state + ref to sync with QR callback closures
  const [isWaitingForNext, setIsWaitingForNext] = useState<boolean>(false);
  const isWaitingForNextRef = useRef<boolean>(false);

  const setWaitingForNextState = (val: boolean) => {
    if (isMounted.current) {
      setIsWaitingForNext(val);
    }
    isWaitingForNextRef.current = val;
  };

  // Scan result states
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'valid' | 'error';
    message: string;
    memberName?: string;
    eventName?: string;
    scannedAt?: string;
  }>({ status: 'idle', message: 'Awaiting pass...' });

  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrCodeId = 'reader';

  // Synth sound generator
  const playBeep = (type: 'success' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High beep
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked by browser policies:', e);
    }
  };

  // Get available cameras on mount
  useEffect(() => {
    if (mode !== 'camera') return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted.current) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        } else {
          setPermissionError('No camera devices detected.');
        }
      })
      .catch((err) => {
        if (!isMounted.current) return;
        console.error('Error fetching cameras:', err);
        setPermissionError('Camera permissions denied or not available.');
      });

    return () => {
      stopScanner();
    };
  }, [mode]);

  // Start scanner when camera or selectedCameraId changes
  useEffect(() => {
    if (mode === 'camera' && selectedCameraId) {
      startScanner(selectedCameraId);
    }
    return () => {
      stopScanner();
    };
  }, [selectedCameraId, mode]);

  // Global key bindings for manual next scan activation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWaitingForNext && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleNextPass();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWaitingForNext]);

  const startScanner = (cameraId: string) => {
    stopScanner(); // safety stop first

    const html5QrCode = new Html5Qrcode(qrCodeId);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        cameraId,
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          // If we are waiting for user to click next, reject scans
          if (isWaitingForNextRef.current) return;
          handleScanSuccess(decodedText);
        },
        () => {
          // Silent failure on read frame parse error (to avoid noise)
        }
      )
      .then(() => {
        // If the component unmounted while start was executing, stop the camera immediately
        if (!isMounted.current) {
          console.log('Scanner started after unmount. Stopping camera immediately...');
          try {
            html5QrCode.stop()
              .catch((err) => console.warn('Failed to stop scanner after unmount:', err));
          } catch (e) {
            console.warn('Sync error stopping scanner after unmount:', e);
          }
          return;
        }
        setScannerActive(true);
        setPermissionError(null);
      })
      .catch((err) => {
        if (!isMounted.current) return;
        console.error('Failed to start scanner:', err);
        setPermissionError(`Failed to start camera: ${err.message || err}`);
        setScannerActive(false);
      });
  };

  const stopScanner = () => {
    const scanner = html5QrCodeRef.current;
    if (scanner && scanner.isScanning) {
      try {
        scanner.stop()
          .then(() => {
            if (isMounted.current) {
              setScannerActive(false);
            }
          })
          .catch((err) => {
            console.warn('Failed to stop scanner asynchronously:', err);
          });
      } catch (err) {
        console.warn('Failed to stop scanner synchronously:', err);
      }
    }
  };

  const processScan = async (payload: string) => {
    setIsSubmitting(true);
    try {
      const res = await api.passes.scan(payload);
      
      if (!isMounted.current) return;

      // Success
      playBeep('success');
      setScanResult({
        status: 'valid',
        message: 'PASS VALIDATED SUCCESSFULLY',
        memberName: res.memberName,
        eventName: res.eventId,
        scannedAt: new Date(res.scannedAt).toLocaleTimeString(),
      });

      // Add to session log
      setScanLogs((prev) => [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          memberName: res.memberName || 'Unknown Member',
          result: 'valid',
          message: 'Access Granted',
          eventName: 'Warehouse Session',
        },
        ...prev,
      ]);

      // If scanning via camera, pause further scans until manual 'Next' action
      if (mode === 'camera') {
        setWaitingForNextState(true);
      }
    } catch (err: any) {
      if (!isMounted.current) return;

      playBeep('error');
      let status: 'invalid' | 'already_scanned' = 'invalid';
      let message = err.message || 'Scan failed';

      if (message.includes('already been scanned') || message.includes('ALREADY_SCANNED')) {
        status = 'already_scanned';
        message = 'TICKET ALREADY SCANNED';
      } else {
        message = 'INVALID TICKET SIGNATURE';
      }

      setScanResult({
        status: 'error',
        message,
      });

      setScanLogs((prev) => [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          memberName: 'Access Denied',
          result: status,
          message,
        },
        ...prev,
      ]);

      // If scanning via camera, pause further scans until manual 'Next' action
      if (mode === 'camera') {
        setWaitingForNextState(true);
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Throttle scan handler to prevent duplicate triggers
  const lastScannedPayload = useRef<string>('');
  const lastScannedTime = useRef<number>(0);

  const handleScanSuccess = (payload: string) => {
    const now = Date.now();
    if (payload === lastScannedPayload.current && now - lastScannedTime.current < 2500) {
      return; // Ignore duplicate scans within 2.5s
    }

    lastScannedPayload.current = payload;
    lastScannedTime.current = now;
    processScan(payload);
  };

  const handleNextPass = () => {
    // Reset throttle and scan control states
    lastScannedPayload.current = '';
    lastScannedTime.current = 0;
    setWaitingForNextState(false);
    if (isMounted.current) {
      setScanResult({ status: 'idle', message: 'Awaiting pass...' });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayload.trim() || isSubmitting) return;
    processScan(manualPayload.trim());
    setManualPayload('');
  };

  return (
    <>
      <CHeader
        title="SCAN PASS"
        sub="gate entry verification"
        action={
          <CBtn
            variant="ghost"
            onClick={() => {
              stopScanner();
              setWaitingForNextState(false);
              setMode(mode === 'camera' ? 'manual' : 'camera');
            }}
          >
            {mode === 'camera' ? 'KEYBOARD INPUT' : 'CAMERA SCANNER'}
          </CBtn>
        }
      />
      <Body>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-xl)', alignItems: 'start' }}>
          
          {/* Left Column: Viewfinder / Input */}
          <div>
            <Panel title={mode === 'camera' ? 'Camera Feed' : 'Manual Code Entry'}>
              {mode === 'camera' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                  
                  {/* Viewfinder Container */}
                  <div style={viewfinderWrapper}>
                    {/* Viewfinder corner brackets */}
                    <div style={{ ...cornerBracket, top: 0, left: 0, borderTop: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)' }} />
                    <div style={{ ...cornerBracket, top: 0, right: 0, borderTop: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)' }} />
                    <div style={{ ...cornerBracket, bottom: 0, left: 0, borderBottom: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)' }} />
                    <div style={{ ...cornerBracket, bottom: 0, right: 0, borderBottom: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)' }} />
                    
                    {/* Scanning Laser Line (only when scanning is active and not paused) */}
                    {scannerActive && !isWaitingForNext && <div className="hive-scan-line" style={scanningLaser} />}
                    
                    {/* Native Video target */}
                    <div id={qrCodeId} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />
                    
                    {/* Overlay status messages */}
                    {permissionError && (
                      <div style={overlayStatus}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>[ ERROR ]</p>
                        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', margin: '4px 0 0', textAlign: 'center' }}>{permissionError}</p>
                      </div>
                    )}
                    
                    {!scannerActive && !permissionError && (
                      <div style={overlayStatus}>
                        <p style={{ color: 'var(--accent-secondary)', fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>[ INITIALIZING ]</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: '4px 0 0' }}>Requesting media permissions...</p>
                      </div>
                    )}

                    {/* Manual Next overlay */}
                    {isWaitingForNext && (
                      <div style={nextOverlayStyle}>
                        <p style={{
                          color: scanResult.status === 'valid' ? 'var(--accent-primary)' : '#ff4e4e',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 'var(--fw-bold)',
                          fontSize: 'var(--fs-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: 'var(--ls-wide)',
                          margin: '0 0 16px'
                        }}>
                          {scanResult.status === 'valid' ? '[ ACCESS GRANTED ]' : '[ ACCESS DENIED ]'}
                        </p>
                        <CBtn variant="solid" onClick={handleNextPass} style={{ padding: '12px 28px', fontSize: 'var(--fs-md)', boxShadow: 'var(--glow-green-sm)' }}>
                          NEXT PASS
                        </CBtn>
                        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-sans)', letterSpacing: 'var(--ls-normal)', margin: '14px 0 0' }}>
                          Press SPACEBAR or ENTER
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Camera select list */}
                  {cameras.length > 1 && (
                    <div>
                      <label style={labelStyle}>Select Input Device</label>
                      <select
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        style={selectStyle}
                      >
                        {cameras.map((cam) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--sp-xs)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: scannerActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      STATUS: {scannerActive ? (isWaitingForNext ? '[ STANDBY / RESUME REQUIRED ]' : '[ SCANNING ACTIVE ]') : '[ OFFLINE ]'}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
                  <div>
                    <label style={labelStyle}>QR Code Payload</label>
                    <textarea
                      placeholder="Paste the decrypted QR payload string (e.g. token:signature)..."
                      value={manualPayload}
                      onChange={(e) => setManualPayload(e.target.value)}
                      style={textareaStyle}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  <CBtn variant="solid" type="submit" disabled={isSubmitting || !manualPayload.trim()}>
                    {isSubmitting ? 'VERIFYING...' : 'VALIDATE PASS'}
                  </CBtn>
                </form>
              )}
            </Panel>
          </div>

          {/* Right Column: Verification Result & Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xl)' }}>
            
            {/* Result Readout */}
            <Panel title="Verification Result">
              <div
                style={{
                  ...resultBox,
                  border: `1px solid ${
                    scanResult.status === 'valid'
                      ? 'var(--accent-primary)'
                      : scanResult.status === 'error'
                      ? '#ff4e4e'
                      : 'var(--border-hairline)'
                  }`,
                  background:
                    scanResult.status === 'valid'
                      ? 'var(--accent-primary-wash)'
                      : scanResult.status === 'error'
                      ? 'rgba(255, 78, 78, 0.04)'
                      : 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 'var(--fw-bold)',
                    fontSize: 'var(--fs-sm)',
                    letterSpacing: 'var(--ls-wide)',
                    color:
                      scanResult.status === 'valid'
                        ? 'var(--accent-primary)'
                        : scanResult.status === 'error'
                        ? '#ff4e4e'
                        : 'var(--text-secondary)',
                  }}
                >
                  {scanResult.status === 'valid'
                    ? '[ ACCESS GRANTED ]'
                    : scanResult.status === 'error'
                    ? '[ ACCESS DENIED ]'
                    : '[ STANDBY ]'}
                </span>
                <h2
                  style={{
                    margin: '12px 0 4px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--fs-xl)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {scanResult.message}
                </h2>
                {scanResult.memberName && (
                  <p style={{ margin: '8px 0 0', fontSize: 'var(--fs-md)', color: 'var(--text-primary)' }}>
                    Holder: <strong style={{ color: 'var(--accent-primary)' }}>{scanResult.memberName}</strong>
                  </p>
                )}
                {scanResult.scannedAt && (
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                    Processed at: {scanResult.scannedAt}
                  </p>
                )}
              </div>
            </Panel>

            {/* Session log */}
            <Panel title="Session Logs">
              <div style={logContainer}>
                {scanLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)', margin: 0, textAlign: 'center', padding: '16px 0' }}>
                    No passes scanned in this session.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
                    {scanLogs.map((log) => (
                      <div key={log.id} style={logItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 'var(--fs-xs)',
                              fontWeight: 'var(--fw-bold)',
                              color:
                                log.result === 'valid'
                                  ? 'var(--accent-primary)'
                                  : '#ff4e4e',
                            }}
                          >
                            {log.result === 'valid' ? '✓ OK' : '✗ DENIED'}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{log.timestamp}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>
                          {log.memberName} — <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

          </div>

        </div>
        
        <style dangerouslySetInnerHTML={{ __html: laserStyleAnimation }} />
      </Body>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────

const viewfinderWrapper: CSSProperties = {
  width: '100%',
  aspectRatio: '1/1',
  background: '#000',
  border: '1px solid var(--border-hairline)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const cornerBracket: CSSProperties = {
  position: 'absolute',
  width: 24,
  height: 24,
  zIndex: 10,
  pointerEvents: 'none',
};

const scanningLaser: CSSProperties = {
  position: 'absolute',
  left: 12,
  right: 12,
  height: '2px',
  background: 'var(--accent-primary)',
  boxShadow: '0 0 10px var(--accent-primary)',
  zIndex: 10,
  pointerEvents: 'none',
};

const overlayStatus: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 5,
};

const nextOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.82)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 15,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-xs)',
  letterSpacing: 'var(--ls-extra-wide)',
  textTransform: 'uppercase',
  color: 'var(--accent-secondary)',
  marginBottom: '8px',
};

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '10px',
  background: 'var(--surface-chrome)',
  border: '1px solid var(--border-hairline)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  height: 100,
  padding: '12px',
  background: 'var(--surface-chrome)',
  border: '1px solid var(--border-hairline)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-sm)',
  outline: 'none',
  resize: 'none',
  boxSizing: 'border-box',
};

const resultBox: CSSProperties = {
  padding: '24px 28px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 140,
};

const logContainer: CSSProperties = {
  maxHeight: 280,
  overflowY: 'auto',
};

const logItem: CSSProperties = {
  padding: '10px 12px',
  background: 'var(--surface-chrome)',
  border: '1px solid var(--border-hairline)',
};

const laserStyleAnimation = `
  .hive-scan-line {
    animation: laser-anim 3s linear infinite;
  }
  @keyframes laser-anim {
    0% { top: 12px; }
    50% { top: calc(100% - 14px); }
    100% { top: 12px; }
  }
`;
