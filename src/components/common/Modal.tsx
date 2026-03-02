import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    width?: string;
}

export default function Modal({ title, children, onClose, width }: ModalProps) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={width ? { maxWidth: width } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}
