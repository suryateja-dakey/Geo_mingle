'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const activitySchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  time: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, "Please use a valid time format (e.g., 9:00 AM, 5:30 PM)."),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Omit<ActivityFormValues, 'id'>) => void;
}

function AddActivityForm({ onAddActivity, onOpenChange }: { onAddActivity: AddActivityDialogProps['onAddActivity'], onOpenChange: (open: boolean) => void}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: '',
      time: '12:00 PM',
    },
  });

  function onSubmit(data: ActivityFormValues) {
    const timeMatch = data.time.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
    let formattedTime = data.time;
    if (timeMatch) {
      formattedTime = `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3].toUpperCase()}`;
    }

    const formattedData = {
      ...data,
      time: formattedTime,
    };
    onAddActivity(formattedData);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 md:px-0">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dinner at the restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g., 7:00 PM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DrawerFooter className="px-0">
          <DrawerClose asChild>
             <Button type="button" variant="ghost">Cancel</Button>
          </DrawerClose>
          <Button type="submit">Add Event</Button>
        </DrawerFooter>
      </form>
    </Form>
  );
}

export function AddActivityDialog({ open, onOpenChange, onAddActivity }: AddActivityDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add Custom Event</DrawerTitle>
            <DrawerDescription>
              Enter the details for your new event below.
            </DrawerDescription>
          </DrawerHeader>
          <AddActivityForm onAddActivity={onAddActivity} onOpenChange={onOpenChange} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Event</DialogTitle>
          <DialogDescription>
            Enter the details for your new event below.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <AddActivityForm onAddActivity={onAddActivity} onOpenChange={onOpenChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
