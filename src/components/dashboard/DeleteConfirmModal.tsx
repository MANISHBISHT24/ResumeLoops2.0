"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resumeTitle: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  resumeTitle,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Resume Draft"
      className="max-w-md"
    >
      <div className="space-y-4 mt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block mb-0.5">Permanent Local Action</span>
            Are you sure you want to delete <strong className="font-bold">&quot;{resumeTitle}&quot;</strong>? This draft will be removed from your browser&apos;s local storage.
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          This operation cannot be undone. Any customized bullets or sections in this draft will be erased.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
