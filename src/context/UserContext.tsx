import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from '../api/client';

interface UserContextType {
    user: User | null;
    login: (name: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Induláskor ellenőrizzük a localStorage-t és a SZERVERT is
    useEffect(() => {
        const initUser = async () => {
            const stored = localStorage.getItem('3nap_user');
            if (stored) {
                try {
                    const localUser = JSON.parse(stored);
                    console.log('UserContext: Found stored user:', localUser);

                    if (!localUser.id) {
                        console.warn('UserContext: Invalid stored user (no ID). Clearing.');
                        localStorage.removeItem('3nap_user');
                        setIsLoading(false);
                        return;
                    }

                    // 1. Megpróbáljuk lekérni a szerverről az ID alapján
                    try {
                        const serverUser = await api.users.get(localUser.id);
                        console.log('UserContext: Server returned user:', serverUser);
                        if (serverUser && serverUser.name) {
                            setUser(serverUser);
                            localStorage.setItem('3nap_user', JSON.stringify(serverUser)); // Frissítjük a helyit is
                        } else {
                            // Ha a szerver visszaad valamit, de nincs neve? (Furcsa lenne)
                            console.warn('UserContext: Server user has no name?', serverUser);
                            setUser(localUser); // Jobb híján
                        }
                    } catch (serverErr) {
                        console.warn('UserContext: User ID not found on server (DB reset?). Attempting silent re-login...', serverErr);

                        // 2. Erőltetett újralogin a helyi névvel
                        if (localUser.name) {
                            try {
                                console.log('UserContext: Re-registering user:', localUser.name);
                                const newUserData = await api.users.login(localUser.name);

                                console.log('UserContext: Re-registration successful. New ID:', newUserData.id);
                                setUser(newUserData);
                                localStorage.setItem('3nap_user', JSON.stringify(newUserData));
                            } catch (loginErr) {
                                console.error('UserContext: CRITICAL - Silent re-login failed:', loginErr);
                                // Ha nem sikerült visszalépni, töröljük a szemetet, hogy a user újra tudjon próbálkozni a főoldalon
                                localStorage.removeItem('3nap_user');
                                setUser(null);
                            }
                        } else {
                            console.warn('UserContext: No name in local storage, cannot re-login. Cleaning up.');
                            localStorage.removeItem('3nap_user');
                            setUser(null);
                        }
                    }

                } catch (e) {
                    console.error('Local storage parse error:', e);
                    localStorage.removeItem('3nap_user');
                }
            } else {
                console.log('UserContext: No stored user found.');
            }
            setIsLoading(false);
        };

        initUser();
    }, []);

    const login = async (name: string) => {
        setIsLoading(true);
        try {
            const userData = await api.users.login(name);
            setUser(userData);
            localStorage.setItem('3nap_user', JSON.stringify(userData));
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('3nap_user');
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
