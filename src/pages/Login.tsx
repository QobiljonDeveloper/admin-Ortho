import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2, MessageSquare, ExternalLink, Timer, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  otp: z.string().length(8, { message: "The OTP code must be exactly 8 digits." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  user: User;
}

const Login = () => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { otp: "" },
  });

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loginMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      // The backend STRICTLY expects exactly { "otp": "string" }
      const response = await api.post<LoginResponse>("/api/auth/admin-login", { otp: otpCode });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast({
        title: "Success",
        description: "Welcome to OrthoMarket Admin Dashboard",
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    if (timeLeft <= 0) {
      toast({
        title: "Code Expired",
        description: "The OTP code has expired. Please get a new one from the bot.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(data.otp);
  };

  const handleGetOTP = () => {
    window.open("https://t.me/ortho_marketbot?start=admin", "_blank");
    setTimeLeft(180); // Reset timer locally for UI
    setValue("otp", ""); // Clear previous attempt
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">OrthoMarket Admin</CardTitle>
          <CardDescription>Authentication required (8-digit OTP)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full justify-between h-12 px-4 border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
            onClick={handleGetOTP}
            disabled={loginMutation.isPending}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Get OTP via Telegram</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Verification</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp" className="text-sm font-medium">OTP Code</Label>
                <div className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${timeLeft < 30 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                  <Timer className="w-3 h-3" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Controller
                  name="otp"
                  control={control}
                  render={({ field }) => (
                    <InputOTP
                      maxLength={8}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loginMutation.isPending}
                    >
                      <InputOTPGroup className="gap-1.5">
                        <InputOTPSlot index={0} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={1} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={2} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={3} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={4} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={5} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={6} className="rounded-md border-border h-11 w-8 text-lg" />
                        <InputOTPSlot index={7} className="rounded-md border-border h-11 w-8 text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {errors.otp && (
                  <p className="flex items-center gap-1 text-[11px] text-destructive font-medium mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.otp.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold transition-all"
              disabled={loginMutation.isPending || timeLeft <= 0}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>

            {timeLeft <= 0 && (
              <p className="text-[11px] text-center text-destructive font-medium italic">
                Code has expired. Request a new one to continue.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
