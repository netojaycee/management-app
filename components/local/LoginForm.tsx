"use client";
import { cn } from "@/lib/utils"; // Your utility for className management
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
import { loginSchema } from "@/lib/zodSchema";
import { useLoginMutation } from "@/redux/appData";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { Loader2 } from "lucide-react";

// type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const [
    login,
    {
      isLoading: isLoadingLogin,
      isSuccess: isSuccessLogin,
      isError: isErrorLogin,
      error: errorLogin,
      // data: dataLogin,
    },
  ] = useLoginMutation();

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    // setGlobalError("");
    try {
      // console.log(values);

      await login(values);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "An unexpected error occurred.";
      toast.error(message);
      // setGlobalError(message);
      console.error("An error occurred:", error);
    }
  };

  React.useEffect(() => {
    if (isSuccessLogin) {
      toast.success(`Login Successful`);
      // if (dataLogin?.data?.user?.kyc_status === "PENDING") {
      //   router.push("/onboarding/kyc");
      // } else {
      router.push("/");
      // }
    } else if (isErrorLogin) {
      if ("data" in errorLogin && typeof errorLogin.data === "object") {
        const errorMessage = (errorLogin.data as { message?: string })?.message;
        // setGlobalError(errorMessage || "Login failed.");
        toast.error(errorMessage || "Login failed.");
      } else {
        // setGlobalError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    }
  }, [isSuccessLogin, isErrorLogin, errorLogin, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='overflow-hidden'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center text-center'>
                  <h1 className='text-2xl font-bold'>Welcome back</h1>
                  <p className='text-balance text-muted-foreground'>
                    Login to your dashboard
                  </p>
                </div>

                {/* Email Input Field */}
                <div className='grid gap-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem className='grid gap-1'>
                        <FormLabel htmlFor='email'>Email</FormLabel>
                        <FormControl>
                          <Input
                            id='email'
                            type='email'
                            placeholder='m@example.com'
                            {...field} // form.control form field
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Input Field */}
                <div className='grid gap-2'>
                  <div className='flex items-center'>
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <a
                      href='#'
                      className='ml-auto text-sm underline-offset-2 hover:underline'
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='grid gap-1'>
                        <FormControl>
                          <Input
                            id='password'
                            type='password'
                            placeholder='********'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className='w-full mt-5'>
                  {isLoadingLogin ? (
                    <Button
                      disabled
                      className='flex items-center justify-center gap-1 w-full'
                      type='submit'
                    >
                      {" "}
                      <span>Please wait</span>
                      <Loader2 className='animate-spin' />
                    </Button>
                  ) : (
                    <Button className='w-full' type='submit'>
                      Login
                    </Button>
                  )}
                </div>

                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                  <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>

                {/* Login with Google Button */}
                <div className='grid'>
                  <Button variant='outline' className='w-full'>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                      <path
                        d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                        fill='currentColor'
                      />
                    </svg>
                    <span>Login with Google</span>
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          {/* Background Image (Hidden on smaller screens) */}
          <div className='relative hidden bg-muted md:block'>
            <Image
              src='/images/auth.jpg'
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale brightness-[0.5]'
              width={200}
              height={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy Links */}
      <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a>{" "}
        and <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  );
}
