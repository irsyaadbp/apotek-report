import { useState } from "react";
import "./App.css";
import {
  Document,
  Packer,
  Paragraph,
  TableRow,
  TableCell,
  Table,
  WidthType,
  AlignmentType,
  VerticalAlign,
  TextRun,
  HeightRule,
} from "docx";
import { saveAs } from "file-saver";
import moment from "moment";
import DatePicker from "react-datepicker";

function App() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("ADMINISTRASI PERCAIKAN CREAM");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    {
      kodeCream: "",
      formula: "",
      pot: "",
      berat: "",
      paraf: "",
      jumlah: null,
    },
  ]);

  const onChange = (index) => (e) => {
    const { value, name } = e.target;

    setData((old) => {
      const newData = old.slice();
      newData[index][name] = ["kodeCream", "paraf"].includes(name)
        ? value.toUpperCase()
        : value;

      return newData;
    });
  };

  const onAddItem = () => {
    setData((old) => {
      const newData = old.slice();
      newData.push({
        kodeCream: "",
        formula: "",
        takaran: "",
        paraf: "",
        jumlah: null,
      });
      return newData;
    });
  };

  const onDeleteItem = (index) => {
    setData((old) => {
      const newData = old.slice();
      newData.splice(index, 1);
      return newData;
    });
  };

  const onGenerateDoc = () => {
    setLoading(true);
    const items = data.reduce((result, item) => {
      const containerParaf = item.paraf.split("\n");
      const parafs = [];
      if (containerParaf.length) {
        containerParaf.forEach((dataParaf) => {
          const userParaf = dataParaf.split("=");
          let totalParaf = 1;
          if (userParaf[1]) {
            totalParaf = userParaf[1];
          }

          for (let index = 0; index < totalParaf; index++) {
            parafs.push({ name: userParaf[0], total: totalParaf });
          }
        });
      }
      const data = Array.from({ length: item.jumlah }, (_, i) => ({
        ...item,
        formula: item.formula.split("\n"),
        pot: item.pot.split("\n"),
        berat: item.berat.split("\n"),
        paraf:
          parafs?.[i]?.name ||
          parafs?.find((p) => p.total === 1)?.name ||
          parafs?.[0]?.name,
        jumlah: undefined,
      })).sort((a, b) => (a.paraf > b.paraf ? -1 : 1));
      result.push(...data);
      return result;
    }, []);

    const table = new Table({
      columnWidths: [600, 1200, 1200, 1200, 1200, 1200, 1200],
      break: 4,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No.",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Tanggal",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No Resep",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Kode Cream",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Formula",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Berat/pot (Garam)",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Berat yang ditimbang",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Paraf",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
          tableHeader: true,
          height: { value: 750, rule: HeightRule.ATLEAST },
        }),
        ...items.map(
          (item, index) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}`,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: moment(date).format("DD/MM/yyyy"),
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.kodeCream,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: item.formula.map(
                    (formula) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: formula,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                  ),
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: item.pot.map(
                    (pot) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: pot,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                  ),
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: item.berat.map(
                    (berat) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: berat,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                  ),
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.paraf,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
              height: { value: 750, rule: HeightRule.ATLEAST },
            })
        ),
      ],
      width: {
        size: 8000,
        type: WidthType.DXA,
      },
    });
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "",
            }),
            new Paragraph({
              text: "",
            }),
            table,
          ],
        },
      ],
    });

    saveDocumentToFile(doc, `${title}-${moment(date).format("DDMMYYYY")}.docx`);
  };

  function saveDocumentToFile(doc, fileName) {
    // const packer = new Packer();
    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    Packer.toBlob(doc)
      .then((blob) => {
        const docblob = blob.slice(0, blob.size, mimeType);
        saveAs(docblob, fileName);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="container pb-56">
      <div className="hero">
        <div className="hero-content text-center">
          <h1 className="text-6xl font-bold">Apotek Report</h1>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <input
          type="text"
          placeholder="Type here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          className="input input-bordered w-full max-w-md"
        />
        <div className="max-w-xs relative">
          <DatePicker
            selected={date}
            onChange={(date) => {
              setDate(date);
            }}
            selectsStart
            startDate={date}
            dateFormat="dd/MM/yyyy"
            nextMonthButtonLabel=">"
            previousMonthButtonLabel="<"
            popperClassName="react-datepicker-right"
          />
        </div>
        <div className="text-right" style={{ flex: 1 }}>
          <button className="btn btn-success my-2 lg:my-0" onClick={onAddItem}>
            Tambah Item
          </button>
        </div>
      </div>

      {data.map((item, index) => (
        <div key={index} className="card bg-base-100 shadow-md mt-4 p-0">
          <div className="card-body">
            <div className="card-actions justify-end">
              <div className="tooltip tooltip-error" data-tip="Hapus Item">
                <button
                  className="btn btn-square btn-error btn-sm"
                  onClick={() => onDeleteItem(index)}
                  disabled={index === 0 && data.length === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Kode Cream</span>
                </label>
                <input
                  type="text"
                  placeholder="Type here"
                  value={item.kodeCream}
                  onChange={onChange(index)}
                  name="kodeCream"
                  className="input input-bordered w-full max-w-xs"
                />
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Formula</span>
                </label>
                <textarea
                  value={item.formula}
                  onChange={onChange(index)}
                  name="formula"
                  className="textarea textarea-bordered"
                  placeholder="Formula"
                ></textarea>
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Berat/pot(Gram)</span>
                </label>
                <textarea
                  value={item.pot}
                  onChange={onChange(index)}
                  name="pot"
                  className="textarea textarea-bordered"
                  placeholder="Pot"
                ></textarea>
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Berat yang ditimbang</span>
                </label>
                <textarea
                  value={item.berat}
                  onChange={onChange(index)}
                  name="berat"
                  className="textarea textarea-bordered"
                  placeholder="berat"
                ></textarea>
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Paraf</span>
                </label>
                <textarea
                  value={item.paraf}
                  onChange={onChange(index)}
                  name="paraf"
                  className="textarea textarea-bordered"
                  placeholder="contoh: E=2"
                ></textarea>
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label font-bold">
                  <span className="label-text">Jumlah Item</span>
                </label>
                <input
                  value={item.jumlah}
                  onChange={onChange(index)}
                  name="jumlah"
                  type="number"
                  placeholder="contoh: 5"
                  className="input input-bordered w-full max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {data.length >= 3 && (
        <div className="flex justify-end mt-4">
          <button className="btn btn-success" onClick={onAddItem}>
            Tambah Item
          </button>
        </div>
      )}

      <div className="btm-nav bg-success p-12">
        <button
          className={`btn ${loading ? "loading" : ""}`}
          onClick={onGenerateDoc}
        >
          {loading ? "Generating..." : "Generate Document"}
        </button>
      </div>
    </div>
  );
}

export default App;
