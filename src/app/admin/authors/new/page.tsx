'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { saveAuthor } from '@/lib/authors';
import { toast } from 'sonner';

export default function NewAuthorPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [twitter, setTwitter] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [website, setWebsite] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        setIsSaving(true);

        try {
            const author = saveAuthor({
                name: name.trim(),
                avatar: avatar.trim() || '/avatar.svg',
                bio: bio.trim(),
                email: email.trim() || undefined,
                socialLinks: {
                    twitter: twitter.trim() || undefined,
                    github: github.trim() || undefined,
                    linkedin: linkedin.trim() || undefined,
                    website: website.trim() || undefined,
                },
            });

            toast.success('Author created!');
            router.push(`/admin/authors/${author.id}/edit`);
        } catch (error) {
            toast.error('Failed to save author');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/authors">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Back to authors</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Author</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new author for blog posts.
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Author name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="author@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="A short bio about the author"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Social Links</CardTitle>
                            <CardDescription>Optional social media profiles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        placeholder="https://twitter.com/username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input
                                        id="github"
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Avatar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatar || '/avatar.svg'} alt="Avatar preview" />
                                    <AvatarFallback>
                                        <User className="h-12 w-12" />
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatar">Avatar URL</Label>
                                <Input
                                    id="avatar"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
