import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface UserProfile {
    user_id?: string;
    name: string;
    ageGroup: "0-18" | "19-24" | "25-50" | "51+" | null;
    gender?: string;
    email?: string;
    profilePicture?: string;
    hasCompletedOnboarding: boolean;
    consentGiven: boolean;
    dashboardStyle?: string;
    chatbotProfile?: string;
    signupTimestamp?: string;
    moodLogs?: { date: string; value: number; label: string }[];
}

interface UserContextType {
    user: UserProfile;
    token: string | null;
    updateUser: (updates: Partial<UserProfile>, newToken?: string) => void;
    clearUser: () => void;
    saveToDatabase: (userData: Partial<UserProfile>) => Promise<void>;
    logMood: (moodValue: number, moodLabel: string) => Promise<void>;
}

const defaultUser: UserProfile = {
    name: "",
    ageGroup: null,
    gender: undefined,
    hasCompletedOnboarding: false,
    consentGiven: false,
    moodLogs: [],
};

// 🛡️ PRIVACY PROTECTION: Lifecycle ID
// This ID must be updated on any significant code change.
// If the stored ID doesn't match, the app forces a full logout.
const APP_LIFECYCLE_ID = "BUILD_2026_02_01_02_45";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
    const [user, setUser] = useState<UserProfile>(defaultUser);

    // 1️⃣ INITIALIZATION: Forced Logout Check
    useEffect(() => {
        const storedLifeId = localStorage.getItem("app_lifecycle_id");
        const storedUser = localStorage.getItem("serenity-user");

        if (storedLifeId !== APP_LIFECYCLE_ID) {
            console.log("🔒 Privacy enforcement: App version mismatch. Clearing sensitive data.");
            clearUser();
            localStorage.setItem("app_lifecycle_id", APP_LIFECYCLE_ID);
        } else if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(defaultUser);
            }
        }
    }, []);

    // 2️⃣ SYNC: User profile to localStorage
    useEffect(() => {
        if (user.user_id || user.name) {
            localStorage.setItem("serenity-user", JSON.stringify(user));
        }
    }, [user]);

    // ✅ Sync token to localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem("auth_token", token);
        } else {
            localStorage.removeItem("auth_token");
        }
    }, [token]);

    const updateUser = (updates: Partial<UserProfile>, newToken?: string) => {
        setUser(prev => ({ ...prev, ...updates }));
        if (newToken) {
            localStorage.setItem("auth_token", newToken);
            setToken(newToken);
        }
    };

    const clearUser = () => {
        setUser(defaultUser);
        setToken(null);
        localStorage.removeItem("serenity-user");
        localStorage.removeItem("auth_token");
    };

    const saveToDatabase = async (userData: Partial<UserProfile>) => {
        if (!user.user_id) return;

        try {
            const data = await apiFetch("/api/user/update", {
                method: "PUT",
                body: JSON.stringify({
                    user_id: user.user_id,
                    ...userData,
                }),
            });
            setUser(prev => ({ ...prev, ...data.user }));
        } catch (error) {
            console.error("Failed to save to database:", error);
        }
    };

    const logMood = async (moodValue: number, moodLabel: string) => {
        const newLog = {
            date: new Date().toISOString(),
            value: moodValue,
            label: moodLabel,
        };

        setUser(prev => ({
            ...prev,
            moodLogs: [...(prev.moodLogs || []), newLog],
        }));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                updateUser,
                clearUser,
                saveToDatabase,
                logMood,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
