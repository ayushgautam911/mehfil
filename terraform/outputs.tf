output "vm_public_ip" {
  description = "The public external IP address of the Compute Engine VM"
  value       = google_compute_instance.vm_instance.network_interface[0].access_config[0].nat_ip
}
