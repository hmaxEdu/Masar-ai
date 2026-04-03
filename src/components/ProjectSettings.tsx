import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useProject,
  useProjectMembers,
  useMyRole,
  masarActions,
  collaborationActions
} from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronRight,
  Settings,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  UserX,
  Trash2,
  Lock,
  Globe,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { type ProjectRole, type ProjectVisibility, type Profile } from '@/lib/supabase';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = useProject(projectId);
  const members = useProjectMembers(projectId);
  const myRole = useMyRole(projectId);

  const [projectName, setProjectName] = useState('');
  const [visibility, setVisibility] = useState<ProjectVisibility>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setVisibility(project.visibility);
    }
  }, [project]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await collaborationActions.searchUsers(searchQuery);
      // Filter out existing members
      setSearchResults(results.filter(r => !members.some(m => m.user_id === r.id)));
      setIsSearching(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, members]);

  if (!project || !projectId) return null;

  // Security check: Only owner and admin can access settings
  const canManage = myRole === 'owner' || myRole === 'admin';
  if (myRole && !canManage) {
    navigate(`/projects/${projectId}`);
    return null;
  }

  const handleUpdateProject = async () => {
    setLoading(true);
    await masarActions.updateProject(projectId, {
      name: projectName,
      visibility
    });
    setLoading(false);
  };

  const handleDeleteProject = async () => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذه الخطوة.')) {
      await masarActions.deleteProject(projectId);
      navigate('/projects/all');
    }
  };

  const handleAddMember = async (user: Profile) => {
    setLoading(true);
    try {
      await collaborationActions.addMember(projectId, user.id, 'viewer');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return <ShieldAlert className="h-4 w-4 text-primary" />;
      case 'admin': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'editor': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleName = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return 'مالك';
      case 'admin': return 'مدير';
      case 'editor': return 'محرر';
      default: return 'مشاهد';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)} className="gap-2">
          <ChevronRight className="h-4 w-4" /> العودة للمشروع
        </Button>
        <span className="text-sm">/</span>
        <span className="text-sm font-medium text-foreground">إعدادات المشروع</span>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> تفاصيل المشروع
            </CardTitle>
            <CardDescription className="text-right">إدارة المعلومات الأساسية والخصوصية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-right block">اسم المشروع</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">خصوصية المشروع</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setVisibility('private')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    visibility === 'private' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <Lock className={`h-6 w-6 ${visibility === 'private' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">خاص</span>
                  <span className="text-xs text-muted-foreground">أعضاء المشروع فقط</span>
                </button>
                <button
                  onClick={() => setVisibility('public')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    visibility === 'public' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <Globe className={`h-6 w-6 ${visibility === 'public' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">عام</span>
                  <span className="text-xs text-muted-foreground">مرئي لجميع أعضاء مسار</span>
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-start">
            <Button onClick={handleUpdateProject} disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> أعضاء الفريق
            </CardTitle>
            <CardDescription className="text-right">إدارة الصلاحيات والوصول للفريق.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-right block">دعوة أعضاء جدد</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن الأعضاء بالبريد الإلكتروني..."
                  className="pr-10 text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-lg divide-y bg-muted/30"
                  >
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarImage src={user.avatar_url} alt={user.email} />
                            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <Button size="sm" onClick={() => handleAddMember(user)} className="gap-2">
                          <UserPlus className="h-4 w-4" /> إضافة
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
                {isSearching && (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-right block font-semibold text-foreground">الأعضاء الحاليون ({members.length})</Label>
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={m.profiles?.avatar_url} alt={m.profiles?.email} />
                        <AvatarFallback className="font-bold">{m.profiles?.email?.[0].toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.profiles?.email}</span>
                          {m.user_id === project.owner_id && (
                            <Badge variant="secondary" className="text-[10px] py-0 h-4">أنت</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          {getRoleIcon(m.role)}
                          {getRoleName(m.role)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.role !== 'owner' && (
                        <>
                          <Select
                            value={m.role}
                            onValueChange={(v) => collaborationActions.updateMemberRole(m.id, v as ProjectRole)}
                          >
                            <SelectTrigger className="h-8 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مدير</SelectItem>
                              <SelectItem value="editor">محرر</SelectItem>
                              <SelectItem value="viewer">مشاهد</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => collaborationActions.removeMember(m.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {m.role === 'owner' && (
                        <div className="px-3 py-1 bg-muted rounded-full text-[10px] font-medium text-muted-foreground">
                          لا يمكن التعديل
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {myRole === 'owner' && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-right text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> منطقة الخطر
              </CardTitle>
              <CardDescription className="text-right">حذف المشروع سيؤدي إلى فقدان جميع المهام والبيانات بشكل دائم.</CardDescription>
            </CardHeader>
            <CardFooter className="justify-start">
              <Button variant="destructive" onClick={handleDeleteProject} className="gap-2">
                <Trash2 className="h-4 w-4" /> حذف المشروع نهائياً
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
