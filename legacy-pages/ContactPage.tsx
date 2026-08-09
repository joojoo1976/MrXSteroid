'use client';

import React from 'react';
import { Page, ContentStrings } from '@/shared/types/types';
import ContactSection from '../features/marketing/ContactSection';

interface ContactPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ content }) => {
    return (
        <div className="space-y-16 pb-20 -mt-20">
            <ContactSection content={content} />
        </div>
    );
};

export default ContactPage;
