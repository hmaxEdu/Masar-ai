import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../assets/masar.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
        }
      }
    });
    if (error) setError(error.message);
    else alert('تأكد من بريدك الإلكتروني لتفعيل الحساب');
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={Logo} alt="Masar Logo" className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-bold">مرحباً بك في مسار</CardTitle>
            <CardDescription>نظام إدارة المهام والتبعيات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تسجيل دخول'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  حساب جديد
                </Button>
              </div>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>
            <Button variant="outline" className="w-full flex gap-2" onClick={handleGoogleSignIn}>
              <Mail className="h-4 w-4" />
              الدخول بواسطة Google
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            تتبع مسارك بدقة وفعالية
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
