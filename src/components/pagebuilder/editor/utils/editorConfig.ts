
interface CreateEditorConfigProps {
  editorId: string;
  initialData?: any;
  readOnly: boolean;
  onChange?: (data: any) => void;
}

export const createEditorConfig = async ({
  editorId,
  initialData,
  readOnly,
  onChange
}: CreateEditorConfigProps) => {
  console.log(`🔧 Creating enhanced editor config for ${editorId}`);
  
  // Dynamic imports for better performance
  const [
    Header,
    Paragraph,
    List,
    Quote,
    Delimiter,
    Checklist
  ] = await Promise.all([
    import('@editorjs/header').then(m => m.default),
    import('@editorjs/paragraph').then(m => m.default),
    import('@editorjs/list').then(m => m.default),
    import('@editorjs/quote').then(m => m.default),
    import('@editorjs/delimiter').then(m => m.default),
    import('@editorjs/checklist').then(m => m.default)
  ]);
  
  return {
    holder: editorId,
    data: initialData || {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Welcome to Your Website',
            level: 1
          }
        },
        {
          type: 'paragraph',
          data: {
            text: 'Start creating amazing content with our enhanced editor!'
          }
        }
      ]
    },
    readOnly,
    tools: {
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2,
          placeholder: 'Enter a header...'
        },
        shortcut: 'CMD+SHIFT+H'
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
        config: {
          placeholder: 'Tell your story...',
          preserveBlank: false
        }
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        },
        shortcut: 'CMD+SHIFT+L'
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author'
        },
        shortcut: 'CMD+SHIFT+O'
      },
      delimiter: {
        class: Delimiter,
        shortcut: 'CMD+SHIFT+D'
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+C'
      }
    },
    onChange: () => {
      if (onChange && !readOnly) {
        // Debounce onChange to avoid too frequent calls
        setTimeout(async () => {
          try {
            const editorElement = document.getElementById(editorId);
            if (editorElement && (editorElement as any).editorInstance) {
              const data = await (editorElement as any).editorInstance.save();
              onChange(data);
            }
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        }, 300);
      }
    },
    placeholder: readOnly ? '' : 'Click here to start writing, or press / to see all available blocks...',
    autofocus: !readOnly,
    logLevel: 'ERROR' as const,
    minHeight: 300,
    defaultBlock: 'paragraph',
    sanitizer: {
      b: true,
      i: true,
      u: true,
      s: true,
      mark: true,
      code: true,
      kbd: true
    },
    // Enhanced UX settings
    hideToolbar: readOnly,
    inlineToolbar: ['link', 'bold', 'italic'],
    tunes: ['textVariant'],
    i18n: {
      messages: {
        ui: {
          "blockTunes": {
            "toggler": {
              "Click to tune": "Click to tune",
            }
          },
          "inlineToolbar": {
            "converter": {
              "Convert to": "Convert to"
            }
          },
          "toolbar": {
            "toolbox": {
              "Add": "Add",
              "Filter": "Filter",
              "Nothing found": "Nothing found"
            }
          }
        },
        toolNames: {
          "Text": "Text",
          "Heading": "Heading", 
          "List": "List",
          "Quote": "Quote",
          "Delimiter": "Delimiter",
          "Checklist": "Checklist"
        },
        tools: {
          "header": {
            "Header": "Header",
            "Heading 1": "Heading 1",
            "Heading 2": "Heading 2", 
            "Heading 3": "Heading 3",
            "Heading 4": "Heading 4",
            "Heading 5": "Heading 5",
            "Heading 6": "Heading 6"
          },
          "list": {
            "Ordered": "Ordered",
            "Unordered": "Unordered"
          }
        }
      }
    }
  };
};
