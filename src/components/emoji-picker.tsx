'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const EMOJI_CATEGORIES = {
    'Writing & Creative': ['✍️', '📝', '✏️', '🖊️', '🖋️', '📖', '📚', '📓', '📕', '📗', '📘', '📙'],
    'Technology': ['💻', '🖥️', '⌨️', '🖱️', '💾', '📱', '🔌', '🔋', '💡', '⚡', '🔬', '🛠️'],
    'Nature': ['🌿', '🌱', '🌺', '🌸', '🌼', '🌻', '🍀', '🌳', '🌴', '🌵', '🍃', '🌾'],
    'Objects': ['💎', '🏆', '🎯', '🎨', '🎭', '🎪', '🎬', '📷', '🎵', '🎶', '🔔', '📌'],
    'Symbols': ['⭐', '✨', '💫', '🌟', '🔥', '❤️', '💜', '💙', '💚', '💛', '🧡', '🖤'],
    'Faces & Animals': ['😊', '🚀', '🦋', '🐦', '🦉', '🐱', '🐶', '🦊', '🐼', '🦁', '🐸', '🌈'],
};

interface EmojiPickerProps {
    value: string;
    onChange: (emoji: string) => void;
    className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (emoji: string) => {
        onChange(emoji);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-16 h-16 text-3xl ${className}`}
                    aria-label="Select emoji"
                >
                    {value || '✍️'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">Choose an icon</h4>
                    {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                        <div key={category}>
                            <p className="text-xs text-muted-foreground mb-2">{category}</p>
                            <div className="grid grid-cols-6 gap-1">
                                {emojis.map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant={value === emoji ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="text-xl h-9 w-9"
                                        onClick={() => handleSelect(emoji)}
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
