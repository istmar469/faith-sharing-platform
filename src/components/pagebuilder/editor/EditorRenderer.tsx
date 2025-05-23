
import React from 'react';
import { cn } from '@/lib/utils';

interface EditorRendererProps {
  data: any;
  className?: string;
}

const EditorRenderer: React.FC<EditorRendererProps> = ({ data, className }) => {
  if (!data || !data.blocks || !Array.isArray(data.blocks)) {
    return <div className="text-gray-400">No content available.</div>;
  }

  return (
    <div className={cn("editor-renderer", className)}>
      {data.blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const HeadingTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag 
                key={index} 
                className={cn(
                  "mt-6 mb-4 font-bold",
                  block.data.level === 1 && "text-4xl",
                  block.data.level === 2 && "text-3xl",
                  block.data.level === 3 && "text-2xl",
                  block.data.level === 4 && "text-xl",
                  block.data.level === 5 && "text-lg",
                  block.data.level === 6 && "text-base"
                )}
              >
                {block.data.text}
              </HeadingTag>
            );
            
          case 'paragraph':
            return (
              <p key={index} className="my-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
            );
            
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index} className={block.data.style === 'ordered' ? "list-decimal ml-6 my-4" : "list-disc ml-6 my-4"}>
                {block.data.items.map((item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
            
          case 'image':
            return (
              <figure key={index} className="my-6">
                <img 
                  src={block.data.file?.url} 
                  alt={block.data.caption || 'Image'} 
                  className="mx-auto rounded-lg shadow-md max-h-[500px] object-contain"
                />
                {block.data.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-2">{block.data.caption}</figcaption>
                )}
              </figure>
            );
            
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 my-6 italic">
                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                {block.data.caption && (
                  <footer className="text-right text-sm text-gray-500 mt-1">— {block.data.caption}</footer>
                )}
              </blockquote>
            );
            
          case 'checklist':
            return (
              <div key={index} className="my-4">
                {block.data.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center space-x-2 my-1">
                    <div className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center",
                      item.checked ? "bg-primary border-primary" : "border-gray-300"
                    )}>
                      {item.checked && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: item.text }} />
                  </div>
                ))}
              </div>
            );
            
          case 'delimiter':
            return <hr key={index} className="my-6 border-t border-gray-300" />;
            
          case 'embed':
            return (
              <div key={index} className="my-6">
                <iframe
                  src={block.data.embed}
                  className="w-full aspect-video rounded-lg shadow-md"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {block.data.caption && (
                  <p className="text-center text-sm text-gray-500 mt-2">{block.data.caption}</p>
                )}
              </div>
            );
            
          case 'raw':
            return (
              <pre key={index} className="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto text-sm">
                <code>{block.data.html}</code>
              </pre>
            );
            
          default:
            return (
              <div key={index} className="text-gray-500 my-2">
                Unsupported block type: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
};

export default EditorRenderer;
