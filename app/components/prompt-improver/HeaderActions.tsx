import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TrashIcon } from "@heroicons/react/24/solid";

interface HeaderActionsProps {
  chainId: string | null;
  onDeleteChain: () => Promise<void>;
}

export function HeaderActions({ chainId, onDeleteChain }: HeaderActionsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {chainId && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
              <TrashIcon className="h-5 w-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chain</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chain? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteChain}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
