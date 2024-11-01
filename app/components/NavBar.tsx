"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  chainName?: string;
  onUpdateChainName?: (newName: string) => void;
  isEditing?: boolean;
}

export function NavBar({
  chainName,
  onUpdateChainName,
  isEditing = false,
}: NavBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(chainName || "");

  const handleSave = () => {
    if (onUpdateChainName) {
      onUpdateChainName(editedName);
    }
    setIsEditingName(false);
  };

  const handleCancel = () => {
    setEditedName(chainName || "");
    setIsEditingName(false);
  };

  return (
    <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Prompt Tree
        </Link>
        {isEditing && (
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-gray-600">{chainName}</h2>
                {onUpdateChainName && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <SignedIn>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            All Chains
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Button variant="outline" size="sm">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </nav>
  );
}
