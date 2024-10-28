export function useTreeCanvasCommon() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const handleWheel = (e: any, setStageCoord: Function, setStageScale: Function) => {
        e.evt.preventDefault();

        const scaleBy = 1.15;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        setStageCoord({
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        });
        setStageScale(newScale);
    };

    return { handleWheel };
}
