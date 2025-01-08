import { useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/supabase';
    import { Button } from '@/components/ui/button';
    import {
      Form,
      FormControl,
      FormField,
      FormItem,
      FormLabel,
      FormMessage,
    } from '@/components/ui/form';
    import { Input } from '@/components/ui/input';
    import { toast } from 'sonner';
    import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
    
    const formSchema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    });
    
    type FormData = z.infer<typeof formSchema>;
    
    export function AuthForm() {
      const [isLoading, setIsLoading] = useState(false);
      const [isSignUp, setIsSignUp] = useState(false);
      const [showOTP, setShowOTP] = useState(false);
      const [otp, setOtp] = useState('');
    
      const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: '',
          password: '',
        },
      });
    
      const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
          if (isSignUp) {
            const { error } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
            });
            if (error) throw error;
            toast.success('Check your email to confirm your account');
            setShowOTP(true);
          } else {
            const { error } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });
            if (error) throw error;
            toast.success('Successfully signed in');
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
          setIsLoading(false);
        }
      };
    
      const handleOTPSubmit = async () => {
        setIsLoading(true);
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: form.getValues().email,
            otp: otp,
          });
          if (error) throw error;
          toast.success('Successfully signed in');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
          setIsLoading(false);
        }
      };
    
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showOTP ? (
              <>
                <InputOTPGroup>
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    onComplete={handleOTPSubmit}
                    length={6}
                    renderSlot={({ index, ...props }) => (
                      <InputOTPSlot index={index} {...props} />
                    )}
                    separator={<InputOTPSeparator />}
                  />
                </InputOTPGroup>
                <Button type="button" onClick={handleOTPSubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify OTP
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      );
    }
