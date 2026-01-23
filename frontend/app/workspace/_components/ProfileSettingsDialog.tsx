'use client';

import React, { useState, useContext } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { User, Settings, ShieldAlert, Trash2, Save, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useAuth, useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';
import { UserDetailContext } from '@/context/UserDetailContext';

export default function ProfileSettingsDialog() {
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(userDetail?.name || '');

    const handleUpdateName = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetail((prev: any) => ({ ...prev, name: response.data.data.name }));
            toast.success('Profile updated');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Account deleted successfully');
            signOut(); // Log out user after deletion
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error('Failed to delete account');
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-xs h-8 flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Settings
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Manage your personal information and account preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-medium">Display Name</Label>
                        <div className="flex gap-2">
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-secondary/50 border-0 focus-visible:ring-1"
                                placeholder="Your name"
                            />
                            <Button onClick={handleUpdateName} disabled={loading || name === userDetail?.name} size="icon" className="shrink-0 bg-foreground text-background hover:bg-foreground/90">
                                <Save className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            DANGER ZONE
                        </div>
                        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
                                <p className="text-[10px] text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full text-xs h-9 flex items-center gap-2">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-background border-border">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                            <ShieldAlert className="h-5 w-5" />
                                            Extreme Caution Required
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will permanently delete your Webyrix account, all your projects, frames, and chat history. This action is irreversible.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-0">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Yes, Delete Everything
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button variant="ghost" onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-foreground gap-2">
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
