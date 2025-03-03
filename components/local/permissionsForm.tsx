import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Textarea for description
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Shadcn UI form components
import { permissionSchema } from "@/lib/zodSchema"; // Zod validation schema
import { IPermission } from "@/lib/types";

type PermissionFormData = z.infer<typeof permissionSchema>;

export function PermissionForm({
  data,
  edit,
}: {
  data: IPermission;
  edit?: boolean;
}) {
  // Mutations for creating and updating permissions
  //   const createPermissionMutation = useCreatePermissionMutation();
  //   const updatePermissionMutation = useUpdatePermissionMutation();

  // Form handling using React Hook Form and Zod validation
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: data || {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: PermissionFormData) => {
    console.log(data);
    // if (edit) {
    //   updatePermissionMutation.mutate({ id: data.id, ...data });
    // } else {
    //   createPermissionMutation.mutate(data);
    // }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">
                    {edit ? "Edit Permission" : "Create Permission"}
                  </h1>
                  <p className="text-muted-foreground">
                    {edit
                      ? "Update the details of the permission."
                      : "Define a new permission for the platform."}
                  </p>
                </div>

                {/* Permission Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel htmlFor="name">Permission Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Permission name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel htmlFor="description">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Permission description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                  {/* {createPermissionMutation.isLoading ||
                  updatePermissionMutation.isLoading
                    ? "Saving..."
                    : edit
                    ? "Update Permission"
                    : "Create Permission"} */}

                    loading
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
