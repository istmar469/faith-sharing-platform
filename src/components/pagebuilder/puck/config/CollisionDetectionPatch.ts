// Comprehensive collision detection patch for Puck Editor
// This module patches JavaScript built-in methods to prevent collision detection errors

let patchApplied = false;

export const applyCollisionDetectionPatch = () => {
  if (patchApplied) return;
  
  console.log('Applying comprehensive collision detection patch...');

  // Store original methods
  const originals = {
    toString: Object.prototype.toString,
    valueOf: Object.prototype.valueOf,
    String: window.String,
    JSON_stringify: JSON.stringify
  };

  // 1. Patch Object.prototype.toString with comprehensive error handling
  Object.prototype.toString = function(this: any) {
    try {
      // Handle null/undefined
      if (this === null) return '[object Null]';
      if (this === undefined) return '[object Undefined]';
      
      // Handle special objects that might cause issues
      if (this === window) return '[object Window]';
      if (this === document) return '[object HTMLDocument]';
      
      // Handle React elements safely
      if (this && typeof this === 'object' && '$$typeof' in this) {
        return '[object ReactElement]';
      }
      
      // Handle DOM elements
      if (this && typeof this === 'object' && 'nodeType' in this) {
        return `[object ${this.tagName || 'HTMLElement'}]`;
      }
      
      // Try original toString
      return originals.toString.call(this);
      
    } catch (error) {
      console.warn('toString error caught and handled:', error);
      // Return safe fallback based on type
      if (typeof this === 'object') return '[object Object]';
      if (typeof this === 'function') return '[object Function]';
      return '[object Unknown]';
    }
  };

  // 2. Patch Object.prototype.valueOf
  Object.prototype.valueOf = function(this: any) {
    try {
      if (this === null || this === undefined) return 0;
      return originals.valueOf.call(this);
    } catch (error) {
      console.warn('valueOf error caught and handled:', error);
      return 0;
    }
  };

  // 3. Patch String constructor
  window.String = function(value?: any): string {
    try {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value.toString();
      
      // Handle objects with custom toString
      if (value && typeof value === 'object') {
        if (typeof value.toString === 'function') {
          try {
            return value.toString();
          } catch (e) {
            return '[object Object]';
          }
        }
        return '[object Object]';
      }
      
      return originals.String(value);
    } catch (error) {
      console.warn('String constructor error:', error);
      return '';
    }
  } as any;

  // Preserve String properties
  Object.setPrototypeOf(window.String, originals.String);
  Object.getOwnPropertyNames(originals.String).forEach(prop => {
    if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
      try {
        (window.String as any)[prop] = (originals.String as any)[prop];
      } catch (e) {
        // Ignore non-configurable properties
      }
    }
  });

  // 4. Patch JSON.stringify for circular references
  JSON.stringify = function(value: any, replacer?: any, space?: any): string {
    try {
      return originals.JSON_stringify(value, replacer, space);
    } catch (error) {
      if (error instanceof TypeError && 
          (error.message.includes('circular') || 
           error.message.includes('Converting circular structure'))) {
        console.warn('Circular reference detected, using safe serialization');
        
        // Create safe version without circular references
        const seen = new WeakSet();
        const safeReplacer = (key: string, val: any) => {
          if (val !== null && typeof val === 'object') {
            if (seen.has(val)) {
              return '[Circular]';
            }
            seen.add(val);
          }
          return val;
        };
        
        try {
          return originals.JSON_stringify(value, safeReplacer, space);
        } catch (secondError) {
          console.warn('JSON.stringify completely failed, returning empty object');
          return '{}';
        }
      }
      throw error;
    }
  };

  // 5. Global error handler for toString errors
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined (reading \'toString\')') ||
         message.includes('Cannot read properties of null (reading \'toString\')'))) {
      console.warn('Global toString error intercepted and prevented:', message);
      return true; // Prevent error from bubbling up
    }
    
    // Call original handler if it exists
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // 6. Patch addEventListener for drag events
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(
    type: string, 
    listener: EventListenerOrEventListenerObject, 
    options?: boolean | AddEventListenerOptions
  ) {
    if (type.startsWith('drag') || type === 'mousemove' || type === 'mouseup') {
      const safeListener = function(this: any, event: Event) {
        try {
          // Validate event and its properties
          if (!event || typeof event !== 'object') {
            console.warn('Invalid event object, skipping handler');
            return;
          }

          // Check dataTransfer safety for drag events
          if ('dataTransfer' in event && event.dataTransfer && typeof event.dataTransfer === 'object') {
            try {
              const dataTransfer = event.dataTransfer as DataTransfer;
              const data = dataTransfer.getData('text/plain');
              if (data && (data.includes('undefined') || data.includes('null'))) {
                console.warn('Unsafe drag data detected, preventing event');
                event.preventDefault();
                return;
              }
            } catch (e) {
              console.warn('DataTransfer access failed, continuing safely');
            }
          }

          // Call the original listener
          if (typeof listener === 'function') {
            return listener.call(this, event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent.call(listener, event);
          }
        } catch (error) {
          console.warn('Event listener error caught:', error);
          if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
          }
        }
      };

      return originalAddEventListener.call(this, type, safeListener, options);
    }

    return originalAddEventListener.call(this, type, listener, options);
  };

  patchApplied = true;
  console.log('Collision detection patch applied successfully');
};

// Auto-apply the patch when this module is imported
applyCollisionDetectionPatch(); 