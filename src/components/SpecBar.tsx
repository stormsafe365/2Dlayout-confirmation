import useStore from "../store";

export default function SpecBar() {
  const width = useStore((s) => s.width);
  const length = useStore((s) => s.length);
  const eave = useStore((s) => s.eave);
  const wind = useStore((s) => s.wind);
  const pitch = useStore((s) => s.pitch);

  const cells: [string, React.ReactNode][] = [
    ["Width",       <>{width}<u>′ W</u></>],
    ["Length",      <>{length}<u>′ L</u></>],
    ["Eave height", <>{eave}<u>′</u></>],
    ["Wind rated",  <>{wind}<u> MPH</u></>],
    ["Roof pitch",  <>{pitch}</>],
  ];

  return (
    <div className="specbar">
      {cells.map(([label, val]) => (
        <div className="cell" key={label}>
          <div className="n">{val}</div>
          <div className="l">{label}</div>
        </div>
      ))}
    </div>
  );
}
