import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title: string;
  metadata?: {
    date: string;
    user_email: string;
    camera: string;
  };
}

const ImageViewModal = ({
  open,
  onOpenChange,
  imageUrl,
  title,
  metadata,
}: ImageViewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
          {metadata && (
            <div className="mt-4 text-sm text-muted-foreground space-y-1">
              <p>Date: {metadata.date}</p>
              <p>User: {metadata.user_email}</p>
              <p>Camera: {metadata.camera}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewModal;