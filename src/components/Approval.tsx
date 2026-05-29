import useStore from "../store";

export default function Approval() {
  const notes = useStore((s) => s.notes);
  const hasNotes = notes.trim().length > 0;

  return (
    <div className="approve">
      <div className="grid" data-notes={hasNotes ? "yes" : "no"}>
        {hasNotes && (
          <div className="notes-col">
            <div className="lab">Notes</div>
            <p className="notes-text">{notes}</p>
          </div>
        )}
        <div className="box">
          <div className="lab">Customer Approval</div>
          <p>
            I have reviewed the opening locations, sizes and building specifications
            shown above and approve this layout for production.
          </p>
          <div className="sig">
            <div className="ln" />
            <div className="sl">Customer Signature</div>
          </div>
          <div className="sig">
            <div className="ln" />
            <div className="sl">Print Name &nbsp;/&nbsp; Date</div>
          </div>
        </div>
      </div>
    </div>
  );
}
