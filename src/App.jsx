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
  UnderlineType,
  convertMillimetersToTwip,
} from "docx";
import { saveAs } from "file-saver";
import moment from "moment";
import DatePicker from "react-datepicker";

function App() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("ADMINISTRASI PERACIKAN CREAM");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    kodeCream: "",
    formula: "",
    pot: "",
    paraf: "",
    jumlah: null,
  });
  const [items, setItems] = useState([]);

  const onChange = (e) => {
    const { value, name } = e.target;

    setData((old) => {
      const newData = { ...old };
      newData[name] = ["kodeCream", "formula", "paraf"].includes(name)
        ? value.toUpperCase()
        : value;

      return newData;
    });
  };

  const onDeleteItem = (index) => {
    setItems((old) => {
      const newData = JSON.parse(JSON.stringify(old));
      newData.splice(index, 1);
      return newData;
    });
  };

  const onAddItem = () => {
    const containerParaf = data.paraf.split("\n");
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
    const dataItem = Array.from({ length: parafs.length }, (_, i) => ({
      ...data,
      formula: data.formula.split("\n"),
      pot: data.pot.split("\n").map((item) => +item.split(",").join(".")),
      potTotal: data.pot.split("\n").map((item) => +item.split(",").join(".")),
      paraf: parafs?.[i]?.name || parafs?.[0]?.name,
      jumlah: 1,
    })).sort((a, b) => (a.paraf > b.paraf ? -1 : 1));

    setItems((old) => [...old, ...dataItem]);
    setData({ kodeCream: "", formula: "", pot: "", paraf: "", jumlah: null });
  };

  const onCancelAddItem = () => {
    setData({ kodeCream: "", formula: "", pot: "", paraf: "", jumlah: null });
  };

  const onChangeJumlah = (index) => (e) => {
    const { value } = e.target;
    setItems((old) => {
      const newData = JSON.parse(JSON.stringify(old));
      newData[index] = {
        ...newData[index],
        jumlah: +value,
        potTotal: newData[index].potTotal.map((__, index) => {
          const pot = newData?.[index]?.pot?.[index];
          const calculate = +value * +pot;
          const isInt = calculate % 1 === 0;

          return isInt ? calculate : calculate.toPrecision(3);
        }),
      };

      return newData;
    });
  };

  const onChangeParaf = (index) => (e) => {
    const { value, name } = e.target;
    setItems((old) => {
      const newData = JSON.parse(JSON.stringify(old));
      newData[index] = {
        ...newData[index],
        [name]: value.toUpperCase(),
      };

      return newData;
    });
  };

  const onDuplicateData = (index) => {
    const newIndex = index + 1;
    setItems((old) => {
      const newData = JSON.parse(JSON.stringify(old));
      newData.splice(newIndex, 0, newData[index]);
      return newData;
    });
  };

  const onGenerateDoc = () => {
    setLoading(true);

    const table = new Table({
      columnWidths: [
        convertMillimetersToTwip(10),
        convertMillimetersToTwip(26.334),
        convertMillimetersToTwip(26.334),
        convertMillimetersToTwip(31),
        convertMillimetersToTwip(26.334),
        convertMillimetersToTwip(26.334),
      ],
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
                      font: "Calibri",
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
                      font: "Calibri",
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
                      font: "Calibri",
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
                      font: "Calibri",
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
                      font: "Calibri",
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
                      font: "Calibri",
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
                          font: "Calibri",
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
                          font: "Calibri",
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${item.kodeCream}${
                            item.jumlah > 1 ? ` (${item.jumlah})` : ""
                          }`,
                          font: "Calibri",
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
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
                            font: "Calibri",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                      })
                  ),
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: item.potTotal.map(
                    (pot) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: String(pot).split(".").join(","),
                            font: "Calibri",
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
                          font: "Calibri",
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
      alignment: AlignmentType.CENTER,
      width: {
        size: convertMillimetersToTwip(146, 3),
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
                  underline: {
                    type: UnderlineType.DASH,
                    color: "000000",
                  },
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

    saveDocumentToFile(
      doc,
      `${title} TGL ${moment(date).format("DDMMYYYY")}.docx`
    );
  };

  function saveDocumentToFile(doc, fileName) {
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
      <div class="hero">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-6xl font-bold">Apotek Report</h1>
            <p class="py-6 font-light">
              Created by{" "}
              <a
                href="http://instagram.com/irsyaadbp"
                target="_blank"
                rel="noopener noreferrer"
                class="link link-primary font-bold"
              >
                Irsyaad Budi
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <input
          type="text"
          placeholder="Type here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          className="input input-bordered w-full lg:max-w-md"
        />
        <div className="lg:max-w-xs relative">
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
      </div>

      <div className="card bg-base-100 shadow-md mt-4 p-0">
        <div className="card-body">
          <div className="overflow-x-auto mt-4">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Tanggal</th>
                  <th>Kode Cream</th>
                  <th>Formula</th>
                  <th>Berat/pot (Gram)</th>
                  <th>Paraf</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((item, index) => (
                    <tr key={`item-${item.kodeCream}-${index}`}>
                      <th>{index + 1}</th>
                      <td>{moment(date).format("DD/MM/YYYY")}</td>
                      <td>
                        {item.kodeCream}{" "}
                        <input
                          value={item.jumlah}
                          onChange={onChangeJumlah(index)}
                          type="number"
                          placeholder="Type here"
                          name="jumlah"
                          className="input input-bordered input-sm ml-1 w-16"
                        />
                      </td>
                      <td>
                        {item.formula.map((formula, idx) => (
                          <p
                            key={`formula-${formula}-${idx}-${index}`}
                            className="mb-0"
                          >
                            {formula}
                          </p>
                        ))}
                      </td>
                      <td>
                        {item.potTotal.map((pot, idx) => (
                          <p
                            key={`formula-${pot}-${idx}-${index}`}
                            className="mb-0"
                          >
                            {String(pot).split(".").join(",")}
                          </p>
                        ))}
                      </td>
                      <td>
                        <input
                          value={item.paraf}
                          onChange={onChangeParaf(index)}
                          type="text"
                          placeholder="Type here"
                          name="paraf"
                          className="input input-bordered w-20"
                        />
                      </td>
                      <td>
                        <div className="flex align-center">
                          <div
                            className="tooltip tooltip-success"
                            data-tip="Duplicate Data"
                          >
                            <button
                              className="btn btn-square btn-outline btn-sm btn-success mr-2"
                              onClick={() => onDuplicateData(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                              </svg>
                            </button>
                          </div>
                          <div
                            className="tooltip tooltip-error"
                            data-tip="Hapus Data"
                          >
                            <button
                              className="btn btn-square btn-error btn-outline btn-sm"
                              onClick={() => onDeleteItem(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={`item-not-found`}>
                    <td colSpan={7} className="p-6">
                      <h3 className="text-center font-bold">No Item Added</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="fixed right-6 bottom-28 lg:bottom-32 lg:right-10">
        <div
          className="tooltip tooltip-success tooltip-left"
          data-tip="Add Item"
        >
          <label
            className="btn btn-lg btn-circle btn-success"
            htmlFor="modal-add-item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>
      </div>

      <div className="btm-nav bg-success p-12 z-20">
        <button
          className={`btn ${loading ? "loading" : ""}`}
          onClick={onGenerateDoc}
          disabled={!items.length}
        >
          {!items.length
            ? "Mohon masukan item terlebih dahulu"
            : loading
            ? "Generating..."
            : "Generate Document"}
        </button>
      </div>

      {/* MODAL ADD ITEM */}
      <input type="checkbox" id="modal-add-item" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          <label
            htmlFor="modal-add-item"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={onCancelAddItem}
          >
            ✕
          </label>
          <h3 className="font-bold text-lg">Add Item</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="form-control w-full">
              <label className="label font-bold">
                <span className="label-text">Kode Cream</span>
              </label>
              <input
                value={data.kodeCream}
                onChange={onChange}
                type="text"
                placeholder="Type here"
                name="kodeCream"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label font-bold">
                <span className="label-text">Formula</span>
              </label>
              <textarea
                value={data.formula}
                onChange={onChange}
                name="formula"
                className="textarea textarea-bordered"
                placeholder="Formula"
                rows={3}
              ></textarea>
            </div>

            <div className="form-control w-full">
              <label className="label font-bold">
                <span className="label-text">Berat/pot (Gram)</span>
              </label>
              <textarea
                value={data.pot}
                onChange={onChange}
                name="pot"
                className="textarea textarea-bordered"
                placeholder={`contoh:\n12\n12`}
                rows={3}
              ></textarea>
            </div>

            <div className="form-control w-full">
              <label className="label font-bold">
                <span className="label-text">Paraf</span>
              </label>
              <textarea
                value={data.paraf}
                onChange={onChange}
                name="paraf"
                className="textarea textarea-bordered"
                placeholder={`contoh:\nE=2\nB=5`}
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="modal-action">
            <label
              htmlFor="modal-add-item"
              className="btn btn-ghost"
              onClick={onCancelAddItem}
            >
              Cancel
            </label>
            <label htmlFor="modal-add-item" className="btn" onClick={onAddItem}>
              Save
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
