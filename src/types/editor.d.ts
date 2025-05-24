
// Basic type declarations for Editor.js and its plugins
declare module '@editorjs/editorjs' {
  export default class EditorJS {
    constructor(options: any);
    isReady: Promise<void>;
    save(): Promise<any>;
    clear(): void;
    render(data: any): Promise<void>;
    destroy(): void;
  }
}

declare module '@editorjs/header' {
  const Header: any;
  export default Header;
}

declare module '@editorjs/paragraph' {
  const Paragraph: any;
  export default Paragraph;
}

declare module '@editorjs/list' {
  const List: any;
  export default List;
}

declare module '@editorjs/image' {
  const Image: any;
  export default Image;
}

declare module '@editorjs/embed' {
  const Embed: any;
  export default Embed;
}

declare module '@editorjs/quote' {
  const Quote: any;
  export default Quote;
}

declare module '@editorjs/checklist' {
  const Checklist: any;
  export default Checklist;
}

declare module '@editorjs/delimiter' {
  const Delimiter: any;
  export default Delimiter;
}

declare module '@editorjs/raw' {
  const Raw: any;
  export default Raw;
}
