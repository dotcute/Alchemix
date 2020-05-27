let playground = (async () => {
    enum playgroundEventType {
        DRAGSTART,
        DRAG,
        DRAGEND
    }
    interface Position {
        x: number;
        y: number;
    }
    interface Item {
        X: number;
        Y: number;
        id: string;
        type: string;
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
        transform: SVGTransform | null;
        assetDatas: {
            base: any;
            names: any;
            assets: any;
            baseAsset: any;
        };
        itemData: Map<string, Item>;
        progress: any;
        createItem: Function;
    }

    document.addEventListener('AlchemixDatasetLoaded', () => {
        if(!document.querySelector('.curtain')) return;
        (<HTMLHtmlElement> document.querySelector('.curtain')).style.setProperty('display','none');
    });

    if (!localStorage.getItem('AlchemixCurrentUserProgress')) localStorage.setItem('AlchemixCurrentUserProgress', JSON.stringify({}));

    const GUID: Function = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16).toUpperCase();
        });
    };

    const postData = (url: string, data: any, type: 'json' | 'text') => {
        return fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data),
        })
        .then(response => response[type]());
    }

    const getData = (url: string, type: 'json' | 'text') => {
        return fetch(url).then(res => res[type]());
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
        transform: null,
        assetDatas: {
            base: await getData('/datasetAPI/defaultDataset/base', 'json'),
            names: await getData('/datasetAPI/defaultDataset/name', 'json'),
            baseAsset: await getData('/datasetAPI/dataset/RDc4RjRCMEItNjQyQi00NENFLUEyRTctN0E0MjUwRThFNUI3.MDAxOTlDMjEwMjREOEMwMA%3D%3D', 'json'),
            assets: {}
        },
        itemData: new Map<string, Item>(),
        progress: JSON.parse(<string> localStorage.getItem('AlchemixCurrentUserProgress')),
        createItem: (type: string, x?: number, y?: number) => {
            if(!playground.assetDatas.baseAsset.datas.map((l: any) => l.id).includes(type)) throw new Error();
            if(x != undefined && y != undefined) {
                const gnode: Element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                gnode.classList.add('item');
                gnode.classList.add('draggable');
                let id = GUID();
                gnode.setAttributeNS(null, 'id', `item_${id}`);
                playground.itemData.set(id, {
                    X: x,
                    Y: y,
                    type: type,
                    id: id
                });
                const snode: Element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                snode.setAttributeNS(null, 'href', playground.assetDatas.baseAsset.datas.find((l: any) => l.id == type).path);
                snode.setAttributeNS(null, 'width', '100px');
                snode.setAttributeNS(null, 'height', '100px');
                gnode.appendChild(snode);
                playground.el.appendChild(gnode);
            } else {
                const gnode: Element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                gnode.classList.add('item');
                gnode.classList.add('draggable');
                let id = GUID();
                gnode.setAttributeNS(null, 'id', `item_${id}`);
                playground.itemData.set(id, {
                    X: 0,
                    Y: 0,
                    type: type,
                    id: id
                });
                const snode: Element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                snode.setAttributeNS(null, 'href', playground.assetDatas.baseAsset.datas.find((l: any) => l.id == type).path);
                snode.setAttributeNS(null, 'width', '100px');
                snode.setAttributeNS(null, 'height', '100px');
                gnode.appendChild(snode);
                playground.el.appendChild(gnode);
            }
        }
    };

    document.dispatchEvent(new CustomEvent('AlchemixDatasetLoaded'));

    playground.addEventListener(playgroundEventType.DRAGSTART, (e: MouseEvent) => {
        if ((e.target as Element).tagName.toLowerCase() == 'svg') return;
        const target: Element | null = (e.target as Element).closest('.item');
        if (!target) return;
        if (!target.classList.contains('draggable')) return;
        playground.selectedElement = <Node> target;
        const temp: Node = playground.selectedElement.cloneNode(true);
        playground.el.appendChild(temp);
        (<Element> playground.selectedElement).remove();
        playground.selectedElement = temp;
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
        const elemId: string = <string> (<Element> playground.selectedElement).getAttributeNS(null, 'id')?.replace('item_', '');
        const item_: Item = <Item> playground.itemData.get(elemId);
        item_.X = coord.x;
        item_.Y = coord.y;
        let c: number = 0;
        playground.itemData.forEach((item: Item) => {
            if(c != 0) return;
            if(item.id == item_.id) {
                return;
            }
            if(!(item.X < item_.X + 70 && item.X > item_.X - 70) || !(item.Y < item_.Y + 70 && item.Y > item_.Y - 70)) {
                (<Element> document.querySelector('.itemCoalescenceHighlight'))?.remove();
                return;
            }
            if(document.querySelector('.itemCoalescenceHighlight')) {
                return;
            }
            c++;
            const fnode = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            fnode.setAttributeNS(null, 'class', 'itemCoalescenceHighlight');
            fnode.setAttributeNS(null, 'width', '120px');
            fnode.setAttributeNS(null, 'height', '120px');
            fnode.setAttributeNS(null, 'x', (item.X - 10).toString());
            fnode.setAttributeNS(null, 'y', (item.Y - 10).toString());
            const dnode = document.createElement('div');
            dnode.style.setProperty('width', '120px');
            dnode.style.setProperty('height', '120px');
            dnode.style.setProperty('background', 'black');
            dnode.style.setProperty('border-radius', '100%');
            dnode.style.setProperty('transform-origin', 'center');
            dnode.style.setProperty('opacity', '0.4');
            dnode.setAttribute('class', 'itemCoalescenceHighlightInnerDiv');
            fnode.appendChild(dnode);
            playground.el.insertBefore(fnode, playground.el.firstChild);
            document.querySelector('.itemCoalescenceHighlightInnerDiv')?.animate([
                { transform: 'scale(0)' }, 
                { transform: 'scale(1)' }
            ], { 
                duration: 100,
                iterations: 1
            });
        });
        if(playground.transform) playground.transform.setTranslate(coord.x, coord.y);
    });

    playground.addEventListener(playgroundEventType.DRAGEND, (e: MouseEvent) => {
        (<Element> document.querySelector('.itemCoalescenceHighlight'))?.remove();
        playground.selectedElement = null;
    });
    
    playground.init();
    return playground;
})();