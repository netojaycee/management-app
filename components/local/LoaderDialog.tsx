"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoaderDialogProps {
  isLoading: boolean;
}

export default function LoaderDialog({ isLoading }: LoaderDialogProps) {
  return (
    <Dialog open={isLoading}>
      <DialogContent
        // hideClose={true}
        className='flex items-center justify-center sm:max-w-[300px]'
      >
        <DialogHeader>
          <DialogTitle className='sr-only'>Loader</DialogTitle>
          <DialogDescription className='sr-only'>
            Loading state
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
