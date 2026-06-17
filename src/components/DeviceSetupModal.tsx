"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDeviceName,
  getOrCreateDeviceId,
  saveDeviceName,
} from "@/src/lib/storage/device";

interface DeviceSetupModalProps {
  onComplete?: (deviceName: string) => void;
  required?: boolean;
}

export function DeviceSetupModal({
  onComplete,
  required = false,
}: DeviceSetupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    const existingDeviceName = getDeviceName();

    if (!existingDeviceName || required) {
      const timeoutId = window.setTimeout(() => {
        setIsOpen(true);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [required]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDeviceName = deviceName.trim();

    if (!trimmedDeviceName) {
      return;
    }

    getOrCreateDeviceId();
    saveDeviceName(trimmedDeviceName);
    onComplete?.(trimmedDeviceName);
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !getDeviceName()) {
          setIsOpen(true);
          return;
        }

        setIsOpen(nextOpen);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Name This Device</DialogTitle>
          <DialogDescription>
            Add a device name so SkillMap can record which local device last
            saved your planner file.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
              placeholder="Home Laptop"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!deviceName.trim()}>
              Save Device
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
