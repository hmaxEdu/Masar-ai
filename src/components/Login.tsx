import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Mail, Loader2, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../assets/masar.png';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split('@')[0] } } })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    else if (isSignUp) alert('Please check your email for the verification link.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden selection:bg-primary/30" dir="ltr">
      


      {/* --- CONTENT --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            className="w-16 h-16  p-0.5 rounded-2xl shadow-2xl mb-4 shadow-primary/20"
          >
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center p-3">
              <img src={Logo} alt="Masar" className="w-full h-full object-contain dark:invert" />
            </div>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-black tracking-tighter text-foreground">
            MASAR
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground text-sm font-medium">
            Manage your path with precision.
          </motion.p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Top accent line using the primary theme color */}
          <div className="h-1.5 w-full bg-primary/20" />
          
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {isSignUp ? 'Sign up to start your journey' : 'Sign in to access your dashboard'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-3">
              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-background/50 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-background/50 border-border focus:ring-2 focus:ring-primary/20 transition-all h-11"
                  />
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs font-semibold text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 font-bold shadow-lg shadow-primary/10 transition-transform active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </motion.div>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-card px-2 text-muted-foreground">Or connect with</span>
              </div>
            </div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-10 gap-2 border-border bg-background/50 hover:bg-accent transition-colors">
                <Chrome className="h-4 w-4" /> Google
              </Button>
              <Button variant="outline" className="h-10 gap-2 border-border bg-background/50 hover:bg-accent transition-colors">
                <Github className="h-4 w-4" /> Github
              </Button>
            </motion.div>
          </CardContent>

          <CardFooter className="bg-muted/30 border-t border-border py-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-full gap-1 group"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <span className="text-primary font-bold group-hover:underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
              <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </CardFooter>
        </Card>
        
        <motion.p 
          variants={itemVariants}
          className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-[0.2em] font-bold opacity-50"
        >
          Masar Productivity Suite
        </motion.p>
      </motion.div>
    </div >
  );
}