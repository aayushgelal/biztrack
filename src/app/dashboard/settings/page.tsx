"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User,
  Building2,
  Phone,
  Mail,
  Cpu,
  Plus,
  Save,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserProfile {
  username: string;
  businessName: string;
  email?: string;
  phone?: string;
}

interface Device {
  id: string;
  name: string;
  serialNumber: string;
  location?: string;
  type: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: "", serialNumber: "", location: "", type: "POS" });
  const [addingDevice, setAddingDevice] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes] = await Promise.all([
          fetch("/api/subscription"),
        ]);
        const subData = await subRes.json();
        if (subData.subscriptions) {
          setDevices(subData.subscriptions.map((s: any) => s.device));
          // Get profile from first subscription's user info
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAddDevice(e: React.FormEvent) {
    e.preventDefault();
    if (!newDevice.name || !newDevice.serialNumber) {
      toast.error("Name and serial number are required");
      return;
    }
    setAddingDevice(true);
    try {
      const res = await fetch("/api/records", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add device");
      }
      toast.success("Device added! A 30-day subscription has been created.");
      setShowAddDevice(false);
      setNewDevice({ name: "", serialNumber: "", location: "", type: "POS" });
      // Refresh
      const subRes = await fetch("/api/subscription");
      const subData = await subRes.json();
      if (subData.subscriptions) {
        setDevices(subData.subscriptions.map((s: any) => s.device));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add device");
    } finally {
      setAddingDevice(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-800 rounded-xl w-32" />
        <div className="h-64 bg-surface-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-surface-500 text-sm mt-0.5">Manage your account and devices</p>
      </div>

      {/* Account section */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center">
            <User size={18} className="text-brand-400" />
          </div>
          <h2 className="section-title">Account Info</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-900 rounded-xl p-4 flex items-center gap-3">
            <User size={16} className="text-surface-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-500">Username</p>
              <p className="text-sm font-semibold text-surface-200">Managed at login</p>
            </div>
          </div>

          <div className="p-4 bg-surface-900/50 border border-surface-700 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Shield size={14} />
              <span className="text-xs font-semibold">Security Note</span>
            </div>
            <p className="text-xs text-surface-500">
              To change your username or password, please contact support. 
              Your account security is important to us.
            </p>
          </div>
        </div>
      </div>

      {/* Devices */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Cpu size={18} className="text-purple-400" />
            </div>
            <h2 className="section-title">Devices</h2>
          </div>
          <button
            onClick={() => setShowAddDevice(!showAddDevice)}
            className="flex items-center gap-1.5 btn-secondary text-sm"
          >
            <Plus size={14} />
            Add Device
          </button>
        </div>

        {/* Add device form */}
        {showAddDevice && (
          <form onSubmit={handleAddDevice} className="mb-5 p-4 bg-surface-900 rounded-xl border border-surface-700 animate-slide-up">
            <h3 className="text-sm font-semibold text-surface-300 mb-3">New Device</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Device Name *</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Main POS"
                  className="input text-sm"
                  required
                />
              </div>
              <div>
                <label className="label text-xs">Serial Number *</label>
                <input
                  type="text"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice((d) => ({ ...d, serialNumber: e.target.value }))}
                  placeholder="SN-12345678"
                  className="input text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="label text-xs">Location</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice((d) => ({ ...d, location: e.target.value }))}
                  placeholder="Store front"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">Type</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice((d) => ({ ...d, type: e.target.value }))}
                  className="input text-sm"
                >
                  <option value="POS">POS Terminal</option>
                  <option value="KIOSK">Kiosk</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => setShowAddDevice(false)} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={addingDevice} className="btn-primary flex-1 text-sm">
                {addingDevice ? "Adding..." : "Add Device"}
              </button>
            </div>
          </form>
        )}

        {/* Device list */}
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3.5 bg-surface-900 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  device.isActive ? "bg-brand-500/10" : "bg-surface-700"
                )}>
                  <Cpu size={16} className={device.isActive ? "text-brand-400" : "text-surface-500"} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-200">{device.name}</p>
                  <p className="text-xs text-surface-500 font-mono">{device.serialNumber}</p>
                  {device.location && (
                    <p className="text-xs text-surface-600">{device.location}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "badge text-xs",
                  device.isActive ? "badge-green" : "badge-red"
                )}>
                  {device.isActive ? (
                    <><CheckCircle size={10} /> Active</>
                  ) : (
                    <><AlertTriangle size={10} /> Inactive</>
                  )}
                </span>
              </div>
            </div>
          ))}
          {!devices.length && (
            <p className="text-surface-600 text-sm text-center py-6">No devices added yet</p>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="card p-5">
        <h2 className="section-title mb-4">App Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-surface-700">
            <span className="text-surface-500">Version</span>
            <span className="text-surface-300 font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-surface-700">
            <span className="text-surface-500">Platform</span>
            <span className="text-surface-300">Web / Mobile</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-surface-500">Support</span>
            <span className="text-brand-400">support@biztrack.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}
