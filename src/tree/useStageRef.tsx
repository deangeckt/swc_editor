import React from 'react';
import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import Konva from 'konva';

interface StageContextType {
    stageRef: React.RefObject<Konva.Stage>;
    setStageRef: (ref: Konva.Stage | null) => void;
}

const StageContext = createContext<StageContextType | null>(null);

export const StageProvider = ({ children }: { children: ReactNode }) => {
    const stageRef = useRef<Konva.Stage | null>(null);

    const setStageRef = useCallback((ref: Konva.Stage | null) => {
        stageRef.current = ref;
    }, []);

    return <StageContext.Provider value={{ stageRef, setStageRef }}>{children}</StageContext.Provider>;
};

export const useSharedStageRef = () => {
    const context = useContext(StageContext);
    if (!context) {
        throw new Error('useSharedStageRef must be used within a StageProvider');
    }
    return context;
};
