import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Mail, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import Logo from '../assets/masar.png';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
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
        },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
    else alert('تأكد من بريدك الإلكتروني لتفعيل الحساب');
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden" dir="rtl">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-md p-4 relative z-10"
      >
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl ring-1 ring-border/50">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="p-3 bg-background rounded-2xl shadow-lg ring-1 ring-border/50">
                <img src={Logo} alt="Masar Logo" className="w-12 h-12 object-contain" />
              </div>
            </motion.div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {isSignUp ? 'انضم إلينا' : 'مرحباً بعودتك'}
              </CardTitle>
              <CardDescription className="text-base">
                {isSignUp ? 'ابدأ رحلتك في إدارة مهامك اليوم' : 'استكمل مسارك من حيث توقفت'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={isSignUp ? 'signup' : 'signin'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={isSignUp ? handleSignUp : handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pr-10 h-12 bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        type="password"
                        placeholder="كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10 h-12 bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-sm font-medium text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    isSignUp ? 'إنشاء حساب' : 'تسجيل دخول'
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground font-medium">أو عبر</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 bg-background/50 hover:bg-background flex gap-3 text-base border-border/50 transition-all active:scale-[0.98]"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 border-t border-border/50 pt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
            >
              {isSignUp ? (
                <>
                  لديك حساب بالفعل؟ <span className="text-primary font-semibold group-hover:underline">سجل دخول</span>
                  <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                </>
              ) : (
                <>
                  ليس لديك حساب؟ <span className="text-primary font-semibold group-hover:underline">أنشئ حساباً جديداً</span>
                  <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground/60 italic font-medium">
              مسار • تتبع مسارك بدقة وفعالية
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
