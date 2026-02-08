const MarkdownRenderer: React.FC<{ content: string; textColor?: string }> = ({ content, textColor = '#e4e4e7' }) => {
    const parseInline = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let key = 0;
        
        while (remaining.length > 0) {
            const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
            if (boldMatch) {
                parts.push(<strong key={key++} style={{ fontWeight: 700, color: '#ffffff' }}>{parseInline(boldMatch[2])}</strong>);
                remaining = remaining.slice(boldMatch[0].length);
                continue;
            }
            
            const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
            if (italicMatch) {
                parts.push(<em key={key++} style={{ fontStyle: 'italic' }}>{parseInline(italicMatch[2])}</em>);
                remaining = remaining.slice(italicMatch[0].length);
                continue;
            }
            
            const codeMatch = remaining.match(/^`([^`]+)`/);
            if (codeMatch) {
                parts.push(
                    <code key={key++} style={{
                        backgroundColor: 'rgba(39, 39, 42, 0.8)',
                        color: '#c084fc',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.9em',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    }}>{codeMatch[1]}</code>
                );
                remaining = remaining.slice(codeMatch[0].length);
                continue;
            }
            
            // Regular character
            const nextSpecial = remaining.slice(1).search(/[\*_`]/);
            if (nextSpecial === -1) {
                parts.push(remaining);
                break;
            }
            parts.push(remaining.slice(0, nextSpecial + 1));
            remaining = remaining.slice(nextSpecial + 1);
        }
        
        return parts;
    };
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    
    const flushList = () => {
        if (listItems.length > 0) {
            const ListTag = listType;
            elements.push(
                <ListTag key={elements.length} style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5em',
                    margin: '1em 0',
                    padding: 0,
                }}>
                    {listItems}
                </ListTag>
            );
            listItems = [];
        }
        inList = false;
    };
    
    lines.forEach((line, i) => {
        const h1Match = line.match(/^# (.+)$/);
        if (h1Match) {
            flushList();
            elements.push(<h1 key={i} style={{ fontSize: '2em', fontWeight: 700, margin: 0, color: '#ffffff' }}>{parseInline(h1Match[1])}</h1>);
            return;
        }
        
        const h2Match = line.match(/^## (.+)$/);
        if (h2Match) {
            flushList();
            elements.push(<h2 key={i} style={{ fontSize: '1.5em', fontWeight: 700, margin: 0, color: '#ffffff' }}>{parseInline(h2Match[2] || h2Match[1])}</h2>);
            return;
        }
        
        const h3Match = line.match(/^### (.+)$/);
        if (h3Match) {
            flushList();
            elements.push(<h3 key={i} style={{ fontSize: '1.25em', fontWeight: 700, margin: 0, color: '#ffffff' }}>{parseInline(h3Match[1])}</h3>);
            return;
        }
        
        if (line.startsWith('> ')) {
            flushList();
            elements.push(
                <blockquote key={i} style={{
                    borderLeft: '4px solid #a855f7',
                    paddingLeft: '1rem',
                    margin: '1.25em 0',
                    color: '#d4d4d8',
                    fontStyle: 'italic',
                }}>{parseInline(line.slice(2))}</blockquote>
            );
            return;
        }
        
        // Unordered list
        const ulMatch = line.match(/^[-*] (.+)$/);
        if (ulMatch) {
            if (!inList || listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            inList = true;
            listItems.push(
                <li key={listItems.length} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{
                        marginRight: '0.5rem',
                        marginTop: '0.6em',
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        backgroundColor: '#a855f7',
                        flexShrink: 0,
                    }} />
                    <span>{parseInline(ulMatch[1])}</span>
                </li>
            );
            return;
        }
        
        const olMatch = line.match(/^(\d+)\. (.+)$/);
        if (olMatch) {
            if (!inList || listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            inList = true;
            listItems.push(
                <li key={listItems.length} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '0.5rem', color: '#a855f7', fontWeight: 600 }}>{olMatch[1]}.</span>
                    <span>{parseInline(olMatch[2])}</span>
                </li>
            );
            return;
        }
        
        if (line.trim() === '') {
            flushList();
            elements.push(<div key={i} style={{ height: '0.5rem' }} />);
            return;
        }
        
        flushList();
        elements.push(<p key={i} style={{ margin: 0, color: textColor }}>{parseInline(line)}</p>);
    });
    
    flushList();
    
    return <div>{elements}</div>;
};

export default MarkdownRenderer;
