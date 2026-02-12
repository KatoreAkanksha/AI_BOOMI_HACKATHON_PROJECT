import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { apiFetch } from "@/lib/api";

export function AuthModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useUser();
    const navigate = useNavigate();

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleAuth = async () => {
        setIsLoading(true);
        try {
            const endpoint = authMode === 'login'
                ? '/api/auth/login'
                : '/api/auth/signup';

            const body = authMode === 'login'
                ? { email, password }
                : { name, email, password };

            const data = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            // Success
            const userProfile = {
                user_id: data.user.user_id,
                name: data.user.name,
                email: data.user.email,
                ageGroup: data.user.age || null,
                gender: data.user.gender,
                profilePicture: data.user.profile_picture,
                hasCompletedOnboarding: !!data.user.age, // if age exists, they finished onboarding
                signupTimestamp: data.user.created_at,
            };

            updateUser(userProfile, data.token);

            toast.success(`Welcome back, ${data.user.name}!`);
            setIsOpen(false);

            // Redirect logic
            if (!userProfile.hasCompletedOnboarding) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/api/auth/google', {
                method: 'POST',
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            const userProfile = {
                user_id: data.user.user_id,
                name: data.user.name,
                email: data.user.email,
                profilePicture: data.user.profile_picture,
                ageGroup: null,
                hasCompletedOnboarding: false,
                consentGiven: false,
                signupTimestamp: data.user.created_at,
            };

            updateUser(userProfile, data.token);
            toast.success(`Welcome, ${data.user.name}!`);
            setIsOpen(false);
            navigate('/onboarding');
        } catch (error: any) {
            console.error('Google Auth Error:', error);
            toast.error(error.message || 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocial = async (provider: 'google' | 'facebook') => {
        if (provider === 'google') {
            toast.info('Please use the Google Sign-In button');
            return;
        }

        // Facebook Login
        setIsLoading(true);
        try {
            // Check if SDK is loaded
            const checkFBSDK = () => new Promise<void>((resolve, reject) => {
                if ((window as any).FB) {
                    resolve();
                    return;
                }

                // Wait up to 5 seconds for SDK to load
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    if ((window as any).FB) {
                        clearInterval(interval);
                        resolve();
                    } else if (attempts > 25) {
                        clearInterval(interval);
                        reject(new Error('Facebook SDK failed to load'));
                    }
                }, 200);
            });

            await checkFBSDK();
            console.log('✅ Facebook SDK ready');

            // Initiate Facebook login
            (window as any).FB.login((response: any) => {
                console.log('Facebook login response:', response);

                if (response.authResponse) {
                    handleFacebookSuccess(response.authResponse.accessToken);
                } else if (response.status === 'not_authorized') {
                    toast.error('Please authorize the app to continue');
                    setIsLoading(false);
                } else {
                    toast.error('Facebook login was cancelled');
                    setIsLoading(false);
                }
            }, {
                scope: 'public_profile,email',
                return_scopes: true
            });

        } catch (error: any) {
            console.error('Facebook SDK Error:', error);
            toast.error('Facebook login unavailable. Please try again later.');
            setIsLoading(false);
        }
    };

    const handleFacebookSuccess = async (accessToken: string) => {
        try {
            console.log('Sending Facebook token to backend...');

            const data = await apiFetch('/api/auth/facebook', {
                method: 'POST',
                body: JSON.stringify({ accessToken })
            });

            console.log('✅ Facebook auth successful:', data.user.name);

            const userProfile = {
                user_id: data.user.user_id,
                name: data.user.name,
                email: data.user.email,
                profilePicture: data.user.profile_picture,
                ageGroup: null,
                hasCompletedOnboarding: false,
                consentGiven: false,
                signupTimestamp: data.user.created_at,
            };

            updateUser(userProfile, data.token);
            toast.success(`Welcome, ${data.user.name}!`);
            setIsOpen(false);
            navigate('/onboarding');
        } catch (error: any) {
            console.error('Facebook authentication error:', error);
            toast.error(error.message || 'Facebook sign-in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0B1437] border-white/10 text-white p-0 overflow-hidden rounded-[2rem]">
                <div className="relative p-8">
                    {/* Background Glows */}
                    <div className="absolute top-[-20%] left-[-10%] w-[100px] h-[100px] bg-[#0075FF]/30 rounded-full blur-[40px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[80px] h-[80px] bg-[#00E0FF]/20 rounded-full blur-[30px] pointer-events-none" />

                    <DialogHeader className="mb-8 relative z-10">
                        <DialogTitle className="text-center text-3xl font-bold tracking-tight text-white mb-2">
                            MindEase
                        </DialogTitle>
                        <p className="text-center text-slate-400 text-sm">
                            {authMode === 'login' ? 'Welcome back to your safe space' : 'Start your journey to better well-being'}
                        </p>
                    </DialogHeader>

                    <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')} className="w-full relative z-10">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
                            <TabsTrigger
                                value="login"
                                className="rounded-lg data-[state=active]:bg-[#0075FF] data-[state=active]:text-white transition-all font-bold"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="rounded-lg data-[state=active]:bg-[#0075FF] data-[state=active]:text-white transition-all font-bold"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Google Sign-In */}
                                <div className="col-span-2">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            toast.error('Google sign-in failed');
                                            setIsLoading(false);
                                        }}
                                        useOneTap={false}
                                        theme="filled_blue"
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                        width="100%"
                                        logo_alignment="left"
                                    />
                                </div>

                                {/* Facebook Login */}
                                <Button
                                    variant="outline"
                                    onClick={() => handleSocial('facebook')}
                                    disabled={isLoading}
                                    className="col-span-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all h-12 rounded-xl font-medium"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-5.978 5.817-5.978.851 0 1.549.07 1.93.118v3.297l-1.332.001c-1.956 0-2.618.929-2.618 2.508v1.634h3.655l-.587 3.666h-3.068v7.98H9.101C9.101 23.691 9.101 23.691 9.101 23.691z" />
                                        </svg>
                                    )}
                                    Continue with Facebook
                                </Button>
                            </div>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                    <span className="bg-[#0B1437] px-4 text-slate-500">
                                        Or credentials
                                    </span>
                                </div>
                            </div>

                            <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 m-0">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-tight text-slate-400 ml-1">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-[#0075FF] focus:ring-[#0075FF]/20 text-white h-12 rounded-xl placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-tight text-slate-400 ml-1">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-[#0075FF] focus:ring-[#0075FF]/20 text-white h-12 rounded-xl"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-[#0075FF] hover:bg-[#0061D5] text-white font-bold h-12 rounded-xl mt-4 shadow-lg shadow-[#0075FF]/30 border-0"
                                    onClick={handleAuth}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "LOG IN"}
                                </Button>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 m-0">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-tight text-slate-400 ml-1">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-[#0075FF] focus:ring-[#0075FF]/20 text-white h-12 rounded-xl placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email-signup" className="text-xs font-bold uppercase tracking-tight text-slate-400 ml-1">Email</Label>
                                    <Input
                                        id="email-signup"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-[#0075FF] focus:ring-[#0075FF]/20 text-white h-12 rounded-xl placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password-signup" className="text-xs font-bold uppercase tracking-tight text-slate-400 ml-1">Password</Label>
                                    <Input
                                        id="password-signup"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-[#0075FF] focus:ring-[#0075FF]/20 text-white h-12 rounded-xl"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-[#0075FF] hover:bg-[#0061D5] text-white font-bold h-12 rounded-xl mt-4 shadow-lg shadow-[#0075FF]/30 border-0"
                                    onClick={handleAuth}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "CREATE ACCOUNT"}
                                </Button>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
