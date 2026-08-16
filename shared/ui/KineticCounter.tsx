import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface KineticCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

const KineticCounter: React.FC<KineticCounterProps> = ({
    value,
    duration: _duration = 2, // Reserved for animation timing configuration
    className = "",
    prefix = "",
    suffix = "",
    decimals = 0
}) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    const displayValue = useTransform(springValue, (latest) => {
        return `${prefix}${latest.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return (
        <motion.span className={className}>
            {displayValue}
        </motion.span>
    );
};

export default KineticCounter;
