const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runTests() {
  console.log('=== Starting Integration Tests ===');

  try {
    // 1. Health check
    console.log('Testing health check...');
    const healthRes = await fetch(`http://localhost:${PORT}/health`);
    if (!healthRes.ok) throw new Error('Health check failed');
    const health = await healthRes.json() as any;
    console.log('Health:', health);

    // 2. Signup admin/organizer
    console.log('\nTesting organizer signup...');
    const signupPayload = {
      email: `admin_${Date.now()}@hive.app`,
      password: 'strongpassword123',
      displayName: 'Main Admin',
      collectiveName: `VOID Collective ${Date.now()}`,
      collectiveHandle: `void_${Date.now()}`,
      location: 'seattle',
      founded: '2026',
    };
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload),
    });
    if (!signupRes.ok) {
      const err = await signupRes.json() as any;
      throw new Error(`Signup failed: ${JSON.stringify(err)}`);
    }
    const signupData = (await signupRes.json() as any).data;
    console.log(`Signup successful! User ID: ${signupData.user.id}, Collective ID: ${signupData.collective.id}`);

    const token = signupData.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };
    const collectiveId = signupData.collective.id;

    // 3. Login
    console.log('\nTesting login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupPayload.email,
        password: signupPayload.password,
      }),
    });
    if (!loginRes.ok) throw new Error('Login failed');
    const loginData = (await loginRes.json() as any).data;
    console.log('Login successful! Welcome back', loginData.user.displayName);

    // 4. Create Event
    console.log('\nTesting event creation...');
    const eventPayload = {
      name: 'Monolith Warehouse Party',
      date: 'sat oct 31',
      time: '22:00',
      endTime: '04:00',
      venue: 'Industrial Unit 3',
      venueAddress: '3 Foundry Lane, District 9',
      status: 'published',
      capacity: 2, // capacity of 2 for testing capacity check
    };
    const eventRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(eventPayload),
    });
    if (!eventRes.ok) {
      const err = await eventRes.json() as any;
      throw new Error(`Event creation failed: ${JSON.stringify(err)}`);
    }
    const event = (await eventRes.json() as any).data;
    console.log(`Event created: "${event.name}" (ID: ${event.id}, Capacity: ${event.capacity})`);

    // 5. Add Members
    console.log('\nAdding members...');
    const m1Payload = { displayName: 'Kira', email: `kira_${Date.now()}@domain.com` };
    const m2Payload = { displayName: 'Cybernaut', email: `cybernaut_${Date.now()}@domain.com` };
    const m3Payload = { displayName: 'Ghost Node', email: `ghost_${Date.now()}@domain.com` };

    const addMember = async (payload: any) => {
      const res = await fetch(`${BASE_URL}/collectives/${collectiveId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json() as any;
        throw new Error(`Failed to add member ${payload.displayName}: ${JSON.stringify(err)}`);
      }
      return (await res.json() as any).data;
    };

    const m1 = await addMember(m1Payload);
    const m2 = await addMember(m2Payload);
    const m3 = await addMember(m3Payload);
    console.log(`Added 3 members: ${m1.displayName} (${m1.id}), ${m2.displayName} (${m2.id}), ${m3.displayName} (${m3.id})`);

    // 6. List Members
    console.log('\nListing members...');
    const listRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/members`, {
      headers: authHeader,
    });
    const members = (await listRes.json() as any).data;
    console.log(`Listed ${members.length} members for collective`);

    // 7. Send Pass (Pass 1)
    console.log(`\nIssuing pass 1 to ${m1.displayName}...`);
    const p1Res = await fetch(`${BASE_URL}/events/${event.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m1.id }),
    });
    if (!p1Res.ok) {
      const err = await p1Res.json() as any;
      throw new Error(`Pass 1 issuance failed: ${JSON.stringify(err)}`);
    }
    const p1 = (await p1Res.json() as any).data;
    console.log(`Pass 1 issued successfully! ID: ${p1.id}, Status: ${p1.status}`);

    // Verify duplicate pass prevention (Same member, same event)
    console.log(`Verifying duplicate pass rejection for ${m1.displayName}...`);
    const p1DupRes = await fetch(`${BASE_URL}/events/${event.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m1.id }),
    });
    if (p1DupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate pass, got ${p1DupRes.status}`);
    }
    const p1DupErr = await p1DupRes.json() as any;
    console.log('Duplicate check succeeded. Error received:', p1DupErr.error.code);

    // 8. Send Pass (Pass 2)
    console.log(`\nIssuing pass 2 to ${m2.displayName}...`);
    const p2Res = await fetch(`${BASE_URL}/events/${event.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m2.id }),
    });
    if (!p2Res.ok) {
      const err = await p2Res.json() as any;
      throw new Error(`Pass 2 issuance failed: ${JSON.stringify(err)}`);
    }
    const p2 = (await p2Res.json() as any).data;
    console.log(`Pass 2 issued successfully! ID: ${p2.id}`);

    // 9. Verify Capacity Limit (Pass 3 should fail because capacity is 2)
    console.log(`\nAttempting to issue pass 3 (exceeding capacity) to ${m3.displayName}...`);
    const p3Res = await fetch(`${BASE_URL}/events/${event.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m3.id }),
    });
    if (p3Res.status !== 409) {
      throw new Error(`Expected 409 Conflict for capacity limit, got ${p3Res.status}`);
    }
    const p3Err = await p3Res.json() as any;
    console.log('Capacity check succeeded. Error received:', p3Err.error.code);

    // 10. Public Pass details check
    console.log(`\nTesting public pass detail retrieval for Pass 1...`);
    const passDetailRes = await fetch(`${BASE_URL}/passes/${p1.id}`);
    if (!passDetailRes.ok) throw new Error('Public pass detail retrieval failed');
    const passDetail = (await passDetailRes.json() as any).data;
    console.log(`Pass retrieved: ${passDetail.user.displayName} is attending ${passDetail.event.name}. QR Payload: ${passDetail.qrPayload}`);

    // 11. Scan Pass
    console.log(`\nTesting pass check-in scanning for Pass 1...`);
    const scanPayload = { qrPayload: passDetail.qrPayload };
    const scanRes = await fetch(`${BASE_URL}/passes/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(scanPayload),
    });
    if (!scanRes.ok) {
      const err = await scanRes.json() as any;
      throw new Error(`Scan check-in failed: ${JSON.stringify(err)}`);
    }
    const scanData = (await scanRes.json() as any).data;
    console.log(`Scan successful! Admitted member: ${scanData.memberName}, Event: ${scanData.eventId}`);

    // Verify double-scan prevention
    console.log(`Verifying double-scan rejection for Pass 1...`);
    const doubleScanRes = await fetch(`${BASE_URL}/passes/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(scanPayload),
    });
    if (doubleScanRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for double scan, got ${doubleScanRes.status}`);
    }
    const doubleScanErr = await doubleScanRes.json() as any;
    console.log('Double scan check succeeded. Error received:', doubleScanErr.error.code);

    // 12. Block member
    console.log(`\nTesting blocking member ${m3.displayName}...`);
    const blockRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/members/${m3.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ status: 'blocked' }),
    });
    if (!blockRes.ok) throw new Error('Failed to block member');
    console.log(`Member ${m3.displayName} successfully blocked!`);

    // Verify blocked member cannot be sent a pass
    console.log(`Verifying blocked member cannot receive passes...`);
    // First, let's create a new event with capacity to avoid capacity limit check failing first
    const event2Res = await fetch(`${BASE_URL}/collectives/${collectiveId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        ...eventPayload,
        name: 'Monolith Part 2',
        capacity: 10,
      }),
    });
    const event2 = (await event2Res.json() as any).data;

    const blockedPassRes = await fetch(`${BASE_URL}/events/${event2.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m3.id }),
    });
    if (blockedPassRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for blocked member pass, got ${blockedPassRes.status}`);
    }
    const blockedPassErr = await blockedPassRes.json() as any;
    console.log('Blocked member validation succeeded. Error received:', blockedPassErr.error.code);

    // 13. Test blocked member pass scan check-in gating
    console.log(`\nTesting blocked member pass scan check-in gating...`);
    console.log(`Blocking member ${m2.displayName}...`);
    const blockM2Res = await fetch(`${BASE_URL}/collectives/${collectiveId}/members/${m2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ status: 'blocked' }),
    });
    if (!blockM2Res.ok) throw new Error('Failed to block member m2');

    // Retrieve public pass details for m2
    const p2DetailRes = await fetch(`${BASE_URL}/passes/${p2.id}`);
    if (!p2DetailRes.ok) throw new Error('Public pass detail retrieval failed for p2');
    const p2Detail = (await p2DetailRes.json() as any).data;

    // Scan m2's pass (should fail with 403 ACCESS_DENIED)
    console.log(`Scanning pass for blocked member ${m2.displayName}...`);
    const scanM2Payload = { qrPayload: p2Detail.qrPayload };
    const scanM2BlockedRes = await fetch(`${BASE_URL}/passes/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(scanM2Payload),
    });
    if (scanM2BlockedRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for blocked member pass scan, got ${scanM2BlockedRes.status}`);
    }
    const scanM2BlockedErr = await scanM2BlockedRes.json() as any;
    if (scanM2BlockedErr.error.code !== 'ACCESS_DENIED') {
      throw new Error(`Expected ACCESS_DENIED error code, got ${scanM2BlockedErr.error.code}`);
    }
    console.log(`Pass scan successfully blocked. Error code: ${scanM2BlockedErr.error.code}`);

    // Unblock m2
    console.log(`Unblocking member ${m2.displayName}...`);
    const unblockM2Res = await fetch(`${BASE_URL}/collectives/${collectiveId}/members/${m2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ status: 'active' }),
    });
    if (!unblockM2Res.ok) throw new Error('Failed to unblock member m2');

    // Scan m2's pass again (should succeed now!)
    console.log(`Scanning pass for unblocked member ${m2.displayName}...`);
    const scanM2OkRes = await fetch(`${BASE_URL}/passes/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(scanM2Payload),
    });
    if (!scanM2OkRes.ok) {
      const err = await scanM2OkRes.json() as any;
      throw new Error(`Expected successful scan after unblocking, got error: ${JSON.stringify(err)}`);
    }
    console.log(`Pass scan successful after unblocking!`);

    // 14. Test event details update (PATCH) and validations
    console.log(`\nTesting event PATCH details updates...`);
    const patchEventRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events/${event2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: 'Monolith Part 2 - Extended Edition',
        date: event2.date,
        time: event2.time,
        venue: 'Underground Vault',
        venueAddress: '12 Cistern Row',
        endTime: '05:30',
        capacity: 15,
        description: 'An extended techno gathering.',
        lineup: ['Charlotte de Witte', 'Kobosil'],
        genres: ['Hard Techno', 'Industrial'],
      }),
    });
    if (!patchEventRes.ok) {
      const err = await patchEventRes.json() as any;
      throw new Error(`Failed to PATCH event details: ${JSON.stringify(err)}`);
    }
    const updatedEvent2 = (await patchEventRes.json() as any).data;
    if (updatedEvent2.name !== 'Monolith Part 2 - Extended Edition' || updatedEvent2.venue !== 'Underground Vault' || updatedEvent2.venueAddress !== '12 Cistern Row' || updatedEvent2.endTime !== '05:30' || updatedEvent2.capacity !== 15) {
      throw new Error('PATCH response did not reflect updated fields correctly');
    }
    console.log(`Event details successfully updated via PATCH!`);

    // Verify capacity validation on PATCH
    console.log(`Unblocking member ${m3.displayName} to test event2 capacity...`);
    const unblockM3Res = await fetch(`${BASE_URL}/collectives/${collectiveId}/members/${m3.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ status: 'active' }),
    });
    if (!unblockM3Res.ok) throw new Error('Failed to unblock member m3');

    console.log(`Issuing a pass for event 2 (capacity 15)...`);
    const pEvent2Res = await fetch(`${BASE_URL}/events/${event2.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m3.id }),
    });
    if (!pEvent2Res.ok) throw new Error('Failed to issue pass for event 2');

    console.log(`Attempting to PATCH capacity to 0 (should fail)...`);
    const patchCapZeroRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events/${event2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: updatedEvent2.name,
        date: updatedEvent2.date,
        time: updatedEvent2.time,
        venue: updatedEvent2.venue,
        capacity: 0,
      }),
    });
    if (patchCapZeroRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for capacity <= 0, got ${patchCapZeroRes.status}`);
    }
    console.log(`PATCH capacity <= 0 validation succeeded.`);

    console.log(`Attempting to PATCH capacity to -5 (should fail)...`);
    const patchCapNegRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events/${event2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: updatedEvent2.name,
        date: updatedEvent2.date,
        time: updatedEvent2.time,
        venue: updatedEvent2.venue,
        capacity: -5,
      }),
    });
    if (patchCapNegRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for negative capacity, got ${patchCapNegRes.status}`);
    }
    console.log(`PATCH negative capacity validation succeeded.`);

    console.log(`Issuing a second pass for event 2 to make passesIssued = 2...`);
    const pEvent2SecondRes = await fetch(`${BASE_URL}/events/${event2.id}/passes/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ memberId: m2.id }),
    });
    if (!pEvent2SecondRes.ok) throw new Error('Failed to issue second pass for event 2');

    console.log(`Attempting to PATCH capacity to 1 (passes issued = 2, should fail)...`);
    const patchCapBelowIssuedRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events/${event2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: updatedEvent2.name,
        date: updatedEvent2.date,
        time: updatedEvent2.time,
        venue: updatedEvent2.venue,
        capacity: 1,
      }),
    });
    if (patchCapBelowIssuedRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for capacity < passesIssued, got ${patchCapBelowIssuedRes.status}`);
    }
    console.log(`PATCH capacity < passesIssued validation succeeded.`);

    // 15. Verify POST capacity validation: capacity must be > 0.
    console.log(`\nTesting event POST capacity validation...`);
    console.log(`Attempting to POST a new event with negative capacity (should fail)...`);
    const postCapNegRes = await fetch(`${BASE_URL}/collectives/${collectiveId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        ...eventPayload,
        name: 'Monolith Part 3',
        capacity: -10,
      }),
    });
    if (postCapNegRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for negative capacity on POST, got ${postCapNegRes.status}`);
    }
    console.log(`POST negative capacity validation succeeded.`);

    console.log('\n=== All Integration Tests Passed Successfully! ===');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! Integration Test failed with error:', error);
    process.exit(1);
  }
}

runTests();
