import z from "zod";
import { ResponsiveModal } from "./responsive-dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Button } from "@/components/ui/button";


interface ThumbnailGenerateModalProps {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
    prompt: z.string().min(10),
});


export const ThumbnailGenerateModal = ({
    videoId,
    open,
    onOpenChange,
}: ThumbnailGenerateModalProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: ""
        }
    });


    const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
        onSuccess: () => {  // 'data' is the response (e.g., workflowRunId from procedures.ts)
            toast.success("Background job started", { description: "This may take some time" });  // Change to success for positive UX
            form.reset();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error('Mutation error:', {
                message: error.message,
                code: error.shape?.code,  // e.g., 'INTERNAL_SERVER_ERROR'
                data: error.shape?.data,
            });
            toast.error(error.message || "Something went wrong");  // Show specific error message
        }
    });


    const onSubmit = (values: z.infer<typeof formSchema>) => {
        generateThumbnail.mutate({
            prompt: values.prompt,
            id: videoId,
        });
    };

    return (
        <ResponsiveModal
            title="Generate a thumbnail"
            open={open}
            onOpenChange={onOpenChange} >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4">
                    <FormField control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field} className="resize-none" cols={30} rows={5} placeholder="A description of wanted thumbnail" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}

                    />

                    <div className="flex justify-end">
                        <Button disabled={generateThumbnail.isPending} type="submit">Generate</Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );



};