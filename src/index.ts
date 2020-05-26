(async () => {
    enum playgroundEventType {
        DRAGSTART,
        DRAG,
        DRAGEND
    }
    interface Position {
        x: number;
        y: number;
    }
    interface Playground {
        el: Node;
        events: Map<playgroundEventType, Function>;
        init: Function;
        addEventListener: Function;
        selectedElement: Node | null;
        getMousePosition: Function;
        offset: Position;
        transform2pos: Function;
        pos2transform: Function;
        confins: {
            minX: number;
            maxX: number;
            minY: number;
            maxY: number;
        },
        transform: SVGTransform | null
    }
    const playground: Playground = {
        el: <Node> document.querySelector('#playground'),
        events: new Map<playgroundEventType, EventListener>(),
        init: (): void => {
            playground.el.addEventListener('mousedown', <EventListener> playground.events.get(playgroundEventType.DRAGSTART));
            playground.el.addEventListener('mousemove', <EventListener> playground.events.get(playgroundEventType.DRAG));
            playground.el.addEventListener('mouseup', <EventListener> playground.events.get(playgroundEventType.DRAGEND));
            playground.el.addEventListener('mouseleave', <EventListener> playground.events.get(playgroundEventType.DRAGEND));
            playground.el.addEventListener('touchstart', <EventListener> playground.events.get(playgroundEventType.DRAGSTART));
            playground.el.addEventListener('touchmove', <EventListener> playground.events.get(playgroundEventType.DRAG));
            playground.el.addEventListener('touchend', <EventListener> playground.events.get(playgroundEventType.DRAGEND));
            playground.el.addEventListener('touchleave', <EventListener> playground.events.get(playgroundEventType.DRAGEND));
            playground.el.addEventListener('touchcancel', <EventListener> playground.events.get(playgroundEventType.DRAGEND));
        },
        addEventListener: (name: playgroundEventType, listener: EventListener): void => {
            playground.events.set(name, listener);
        },
        selectedElement: null,
        getMousePosition: (e: MouseEvent): Position => {
            const CTM = (playground.el as SVGGraphicsElement).getScreenCTM();
            if(!CTM) throw new TypeError();
            if((e as any).touches) { e = (e as any).touches[0]; }
            return <Position> {
                x: (e.clientX - CTM.e) / CTM.a,
                y: (e.clientY - CTM.f) / CTM.d
            }
        },
        offset: {
            x: 0,
            y: 0
        },
        transform2pos: (transform: string): Position => {
            return <Position> {
                x: parseFloat(transform.replace('translate(','').replace(/\,[0-9\.]+\)/,'')),
                y: parseFloat(transform.replace(/translate\([0-9\.]+\,/,'').replace(')',''))
            };
        },
        pos2transform: (pos: Position): string => {
            return `translate(${pos.x},${pos.y})`;
        },
        confins: {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
        transform: null
    };
    playground.addEventListener(playgroundEventType.DRAGSTART, (e: MouseEvent) => {
        const target: Element | null = (e.target as Element).closest('.item');
        if(!target) return;
        if(!target.classList.contains('draggable')) return;
        playground.selectedElement = <Node> target;
        let transforms = (playground.selectedElement as SVGGraphicsElement).transform.baseVal;
        if (transforms.numberOfItems === 0 ||
            transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
          const translate = (playground.el as SVGSVGElement).createSVGTransform();
          translate.setTranslate(0, 0);
          (playground.selectedElement as SVGGraphicsElement).transform.baseVal.insertItemBefore(translate, 0);
        }
        playground.transform = transforms.getItem(0);
        playground.offset = playground.getMousePosition(e);
        playground.offset.x -= playground.transform.matrix.e;
        playground.offset.y -= playground.transform.matrix.f;
        const bbox: SVGRect = (playground.selectedElement as SVGGraphicsElement).getBBox();
        playground.confins = {
            minX: 0 - bbox.x,
            maxX: (playground.el as Element).getBoundingClientRect().width - bbox.x - bbox.width,
            minY: 0 - bbox.y,
            maxY: (playground.el as Element).getBoundingClientRect().height - bbox.y - bbox.height,
        };
    });
    playground.addEventListener(playgroundEventType.DRAG, (e: MouseEvent) => {
        if(!playground.selectedElement) return;
        e.preventDefault();
        const coord: Position = playground.getMousePosition(e);
        coord.x -= playground.offset.x;
        coord.y -= playground.offset.y;
        if(coord.x < playground.confins.minX) coord.x = playground.confins.minX;
        if(coord.x > playground.confins.maxX) coord.x = playground.confins.maxX;
        if(coord.y < playground.confins.minY) coord.y = playground.confins.minY;
        if(coord.y > playground.confins.maxY) coord.y = playground.confins.maxY;
        if(playground.transform) playground.transform.setTranslate(coord.x, coord.y);
    });
    playground.addEventListener(playgroundEventType.DRAGEND, (e: MouseEvent) => {
        const coord: Position = playground.getMousePosition(e);
        coord.x -= playground.offset.x;
        coord.y -= playground.offset.y;
        if(coord.x < playground.confins.minX) coord.x = playground.confins.minX;
        if(coord.x > playground.confins.maxX) coord.x = playground.confins.maxX;
        if(coord.y < playground.confins.minY) coord.y = playground.confins.minY;
        if(coord.y > playground.confins.maxY) coord.y = playground.confins.maxY;
        if(playground.transform) playground.transform.setTranslate(coord.x, coord.y);
        playground.selectedElement = null;
    });
    playground.init();
})();