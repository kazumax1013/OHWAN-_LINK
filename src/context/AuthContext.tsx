import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  department: string;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isEditor: false,
  login: () => Promise.resolve(false),
  register: () => Promise.resolve(false),
  logout: () => {},
  updateProfile: () => Promise.resolve(false),
  resetPassword: () => Promise.resolve({ success: false, message: '' }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            const user: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              department: profile.department,
              position: profile.position,
              avatarUrl: profile.avatar_url,
              skills: profile.skills,
              interests: profile.interests,
              joinedAt: profile.joined_at,
              role: profile.role
            };
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              const user: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                department: profile.department,
                position: profile.position,
                avatarUrl: profile.avatar_url,
                skills: profile.skills,
                interests: profile.interests,
                joinedAt: profile.joined_at,
                role: profile.role
              };
              setCurrentUser(user);
              setIsAuthenticated(true);
            }
          });
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            department: profile.department,
            position: profile.position,
            avatarUrl: profile.avatar_url,
            skills: profile.skills,
            interests: profile.interests,
            joinedAt: profile.joined_at,
            role: profile.role
          };
          setCurrentUser(user);
          setIsAuthenticated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('Registration error:', authError);
        return false;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            department: userData.department,
            position: '社員',
            avatar_url: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
            skills: [],
            interests: [],
            role: 'user'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return false;
        }

        const newUser: User = {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          department: userData.department,
          position: '社員',
          avatarUrl: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
          skills: [],
          interests: [],
          joinedAt: new Date().toISOString(),
          role: 'user'
        };

        setCurrentUser(newUser);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      setIsLoading(true);

      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl;
      if (updates.skills) dbUpdates.skills = updates.skills;
      if (updates.interests) dbUpdates.interests = updates.interests;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (error) {
        console.error('Profile update error:', error);
        return false;
      }

      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return {
          success: false,
          message: 'パスワードリセットメールの送信に失敗しました。メールアドレスを確認してください。',
        };
      }

      return {
        success: true,
        message: 'パスワードリセット用のメールを送信しました。メールを確認してください。',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'パスワードリセット中にエラーが発生しました。',
      };
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isEditor = currentUser?.role === 'editor' || isAdmin;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      isAuthenticated,
      isAdmin,
      isEditor,
      login,
      register,
      logout,
      updateProfile,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};