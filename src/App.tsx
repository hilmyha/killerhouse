import "./App.css";
import { useState } from "react";
import { Wheel } from "react-custom-roulette";

function App() {
  // Master mapping
  const master: Record<string, "A" | "B" | "C"> = {
    kuncoro: "A",
    jeki: "B",
    yatno: "C",
  };

  const [data, setData] = useState<{ option: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  // const [groupIndex, setGroupIndex] = useState(0); // giliran random/group
  const [groups, setGroups] = useState({
    A: [] as string[],
    B: [] as string[],
    C: [] as string[],
  });

  const handleSpinClick = () => {
    if (data.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStop = () => {
    const winner = data[prizeNumber].option.trim().toLowerCase();
    const newGroups = { ...groups };

    if (master[winner]) {
      // kalau ada di master → langsung masuk grup sesuai mapping
      newGroups[master[winner]].push(winner);
    } else {
      // cari grup dengan anggota paling sedikit
      const counts = {
        A: newGroups.A.length,
        B: newGroups.B.length,
        C: newGroups.C.length,
      };
      const minCount = Math.min(counts.A, counts.B, counts.C);

      // filter grup yang masih paling sedikit anggotanya
      const candidateGroups = (["A", "B", "C"] as const).filter(
        (g) => counts[g] === minCount
      );

      // pilih random dari grup yang kandidat
      const chosen =
        candidateGroups[Math.floor(Math.random() * candidateGroups.length)];

      newGroups[chosen].push(winner);
    }

    setGroups(newGroups);

    // Hapus dari spinner
    const newData = data.filter((_, i) => i !== prizeNumber);
    setData(newData);

    setMustSpin(false);
  };

  const handleAddName = () => {
    const trimmedName = newName.trim();
    if (trimmedName === "") {
      setErrorMessage("Nama tidak boleh kosong!");
      return;
    }

    const isDuplicate = data.some(
      (item) => item.option.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage("Nama sudah ada di daftar!");
      return;
    }

    setData([...data, { option: trimmedName }]);
    setNewName("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Spin Wheel Grup A-B-C</h1>

      {data.length > 0 ? (
        <>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={["#3e3e3e", "#df3428"]}
            textColors={["#ffffff"]}
            onStopSpinning={handleStop}
          />
          <button
            onClick={handleSpinClick}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            disabled={mustSpin}
          >
            SPIN
          </button>
        </>
      ) : (
        <p className="text-red-500 font-semibold">
          Belum ada data. Silakan tambah nama dulu!
        </p>
      )}

      {/* Form tambah data */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border px-3 py-2 rounded w-64"
            placeholder="Masukkan nama"
          />
          <button
            onClick={handleAddName}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Tambah
          </button>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>

      {/* Tabel hasil */}
      <table className="border-collapse border border-gray-400 w-full max-w-2xl mt-6 text-center">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">Grup A</th>
            <th className="border border-gray-400 px-4 py-2">Grup B</th>
            <th className="border border-gray-400 px-4 py-2">Grup C</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(
            {
              length: Math.max(
                groups.A.length,
                groups.B.length,
                groups.C.length
              ),
            },
            (_, i) => (
              <tr key={i}>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.A[i] || ""}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.B[i] || ""}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.C[i] || ""}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
