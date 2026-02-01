
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Sparkles, Shield, Heart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/api";

const ageGroups = [
    { value: '0-18' as const, label: '0-18', description: 'Teen & Young' },
    { value: '19-24' as const, label: '19-24', description: 'Young Adult' },
    { value: '25-50' as const, label: '25-50', description: 'Adult' },
    { value: '51+' as const, label: '51+', description: 'Mature Adult' },
];

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    { value: 'other', label: 'Other' },
];

export default function Onboarding() {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [selectedAge, setSelectedAge] = useState<'0-18' | '19-24' | '25-50' | '51+' | null>(null);
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [consentChecked, setConsentChecked] = useState(false);
    const { user, updateUser } = useUser();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user.user_id) {
            navigate('/');
            return;
        }
        if (user.hasCompletedOnboarding) {
            navigate('/dashboard');
            return;
        }
    }, [user.user_id, user.hasCompletedOnboarding, navigate]);

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            setIsLoading(true);
            const updates = {
                name: name || 'Friend',
                ageGroup: selectedAge,
                gender: selectedGender || undefined,
                hasCompletedOnboarding: true,
                consentGiven: consentChecked,
            };

            // If user logged in (has ID), update backend
            if (user.user_id) {
                try {
                    const data = await apiFetch("/api/user/update", {
                        method: 'PUT',
                        body: JSON.stringify({
                            user_id: user.user_id,
                            name: updates.name,
                            age: updates.ageGroup, // Backend expects 'age', we map from ageGroup
                            gender: updates.gender
                        })
                    });
                    updateUser(data.user);
                } catch (error) {
                    console.error('Failed to sync profile to database:', error);
                }
            }

            updateUser(updates);
            setIsLoading(false);
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate('/');
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return name.trim().length > 0;
            case 2: return selectedAge !== null;
            case 3: return true;
            case 4: return consentChecked;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans relative flex items-center justify-center p-4">
            {/* Dark Background Gradients - Consistent with Welcome Page */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="absolute -top-12 left-0 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToHome')}
                </Button>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className={`flex items-center ${num < 4 ? 'flex-1' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= num ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-muted text-muted-foreground'}`}>
                                    {num}
                                </div>
                                {num < 4 && <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > num ? 'bg-primary' : 'bg-muted'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-8 shadow-elevated border-border/50">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="w-8 h-8 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-2">{t('welcomeToMindEase')} ✨</h2>
                                        <p className="text-muted-foreground text-lg">{t('tagline')}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">{t('howFeeling')}</label>
                                        <Input
                                            type="text"
                                            placeholder={t('typeMessage')}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="text-lg p-6"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-accent-foreground" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-2">{t('hi')}, {name}! 👋</h2>
                                        <p className="text-muted-foreground text-lg">Please select your age group</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {ageGroups.map((age) => (
                                            <Card
                                                key={age.value}
                                                onClick={() => setSelectedAge(age.value)}
                                                className={`p-6 cursor-pointer transition-all ${selectedAge === age.value ? 'ring-2 ring-primary bg-primary/5 shadow-lg' : 'hover:shadow-md hover:bg-muted/50'}`}
                                            >
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-foreground mb-1">{age.label}</p>
                                                    <p className="text-sm text-muted-foreground">{age.description}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-highlight-foreground" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-2">One more thing...</h2>
                                        <p className="text-muted-foreground text-lg">Would you like to share your gender?</p>
                                    </div>
                                    <div className="space-y-3">
                                        {genderOptions.map((gender) => (
                                            <Card
                                                key={gender.value}
                                                onClick={() => setSelectedGender(gender.value)}
                                                className={`p-4 cursor-pointer transition-all ${selectedGender === gender.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                                            >
                                                <p className="text-center font-medium text-foreground">{gender.label}</p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-2">{t('disclaimerTitle')}</h2>
                                    </div>
                                    <div className="space-y-4 bg-muted/30 p-6 rounded-xl">
                                        <p className="text-foreground text-sm leading-relaxed">{t('disclaimerDesc')}</p>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                                        <Checkbox
                                            id="consent"
                                            checked={consentChecked}
                                            onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                                        />
                                        <label htmlFor="consent" className="text-sm text-foreground cursor-pointer leading-relaxed">
                                            {t('privacyPolicy')} & {t('termsOfService')}
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <Button variant="outline" onClick={handleBack} className="flex-1">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {step === 1 ? t('home') : t('back')}
                                </Button>
                                <Button onClick={handleNext} disabled={!canProceed() || isLoading} className="flex-1 bg-[#0075FF] hover:bg-[#0061D5] text-white border-0">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    {step === 4 ? t('completeSetup') : t('continue')}
                                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>

                            {step === 3 && (
                                <Button variant="ghost" onClick={handleNext} className="w-full mt-2 text-muted-foreground">
                                    {t('skipStep')}
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
