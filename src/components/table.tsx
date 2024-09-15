import React, { useState, useEffect, useRef } from "react";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox"; // Ensure you import the Checkbox component
import axios from "axios";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const DataTableComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedArtWorks, setSelectedArtWorks] = useState<Artwork[]>([]);
  const [first, setFirst] = useState(0);

  const [selectRows, setselectRows] = useState(0);
  const [remainingRows, setRemainingRows] = useState<number>(0);

  const op = useRef<OverlayPanel>(null);
  const fetchArtworks = async (page?: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page ? page + 1 : 1}`
      );
      setArtworks(response.data.data);
      setTotalRecords(response.data.pagination.total);
      if (remainingRows > 0) {
        const data = response.data.data.slice(
          0,
          remainingRows > 12 ? 12 : remainingRows
        );
        setSelectedArtWorks((prev) => [...prev, ...data]);
        setRemainingRows((prev) => {
          if (prev > 12) {
            return prev - 12;
          } else {
            return 0;
          }
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const onPage = (event: DataTablePageEvent) => {
    const { page, first } = event;
    setFirst(first);
    fetchArtworks(page);
  };

  const onSelectionChange = (
    event: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    const selectArt = event.value;
    setSelectedArtWorks(selectArt);
    setSelectAll(selectArt.length === artworks.length);
  };

  const onSelectAllChange = (event: CheckboxChangeEvent) => {
    const selectAll = event.checked;
    if (selectAll) {
      setSelectAll(true);
      setSelectedArtWorks(artworks);
    } else {
      setSelectAll(false);
      setSelectedArtWorks([]);
    }
  };

  const submitHandler = () => {
    if (!op.current) return;
    op.current?.hide();
    // i wan all number of rows selected
    const data = artworks.slice(0, selectRows > 12 ? 12 : selectRows);
    setSelectedArtWorks((prev) => [...prev, ...data]);
    setRemainingRows(selectRows > 12 ? selectRows - 12 : 0);
  };
  const headerTemplate = (
    <div
      className="header-content"
      style={{ display: "flex", alignItems: "center" }}
    >
      <Checkbox
        onChange={onSelectAllChange}
        checked={selectAll}
        className="p-checkbox p-component"
        style={{ marginRight: "0.5rem" }}
      />
      <Button
        type="button"
        label="Select rows"
        onClick={(e) => {
          if (!op.current) return;
          op.current.toggle(e);
        }}
      />
      <OverlayPanel ref={op}>
        <InputNumber
          inputId="integeronly"
          value={selectRows}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setselectRows(e.value ? e.value : 0)
          }
        />
        <Button label="Submit" onClick={submitHandler} />
      </OverlayPanel>
    </div>
  );

  const rowCheckboxTemplate = (rowData: Artwork) => (
    <Checkbox
      checked={selectedArtWorks.includes(rowData)}
      onChange={(e) => {
        const isChecked = e.checked;
        let updatedSelection = [...selectedArtWorks];
        if (isChecked) {
          updatedSelection = [...selectedArtWorks, rowData];
        } else {
          updatedSelection = updatedSelection.filter(
            (item) => item.id !== rowData.id
          );
        }
        setSelectedArtWorks(updatedSelection);
        setSelectAll(updatedSelection.length === artworks.length);
      }}
    />
  );

  return (
    <div className="card">
      <DataTable
        value={artworks}
        lazy
        dataKey="id"
        selectionMode="multiple"
        paginator
        first={first}
        rows={12}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        tableStyle={{ minWidth: "75rem" }}
        selection={selectedArtWorks}
        onSelectionChange={onSelectionChange}
        scrollable
        scrollHeight="90vh"
      >
        <Column header={headerTemplate} body={rowCheckboxTemplate} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default DataTableComponent;
