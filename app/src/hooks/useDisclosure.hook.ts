'use client';

import { useState } from 'react';

const useDisclosure = () => {
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    const onToggle = () => setIsOpen(!isOpen);

    return {
        onOpen,
        onClose,
        onToggle,
        isOpen,
    };
};

export default useDisclosure;