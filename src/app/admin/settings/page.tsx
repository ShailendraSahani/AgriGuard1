'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as { role: string })?.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || (session.user as { role: string })?.role !== 'admin') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="AgriGuard" />
          </div>
          <div>
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input id="admin-email" type="email" defaultValue="admin@agriguard.com" />
          </div>
          <div>
            <Label htmlFor="support-phone">Support Phone</Label>
            <Input id="support-phone" defaultValue="+1 (555) 123-4567" />
          </div>
          <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
            <Input id="maintenance-mode" type="checkbox" />
          </div>
          <div>
            <Label htmlFor="debug-mode">Debug Mode</Label>
            <Input id="debug-mode" type="checkbox" />
          </div>
          <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
