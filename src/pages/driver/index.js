/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-underscore-dangle
import { getAmountEarn, getDrivers } from 'actions/driver';
import CustomInput from 'components/CustomInput';
import SelectBox from 'components/SelectBox';
import TableData from 'components/TableData';
import { columnsTableDriver } from 'constants/columsTable/columsDriver';
import useDataTable from 'hooks/useDataTable';
import { cloneDeep, isEmpty } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ExpandableRowsComponent from 'components/Driver/expandableRowsComponent';

const status = ['active', 'deactivate'];

export default function Driver() {
  const [searchByName, setSearchByName] = useState('');
  const [searchById, setSearchById] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    handlePageChange,
    handlePerRowsChange,
    limit,
    totalRows,
    setTotalRows,
    currentPage,
    data,
    setData,
  } = useDataTable();

  // const [dataDriver, setData] = useState([]);

  // filter
  const [selectedPersons, setSelectedPersons] = useState([]);
  const statusFilter = useMemo(
    () => selectedPersons.map((itemFilter) => ({ value: itemFilter })),
    [selectedPersons]
  );
  const isSelected = (value) => !!selectedPersons.find((el) => el === value);

  const removeItem = (person) => {
    const removedSelection = selectedPersons.filter((selected) => selected !== person);
    setSelectedPersons(removedSelection);
  };

  const handleSelection = (person) => {
    const selectedResult = selectedPersons.filter((selected) => selected === person);
    if (selectedResult.length) {
      removeItem(person);
    } else {
      setSelectedPersons((currents) => [...currents, person]);
    }
  };
  // filter

  // data table driver
  const flagGetDataEarn = useRef(false);

  const onGetDriver = async (page = 1) => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const response = await getDrivers({
        page,
        limit,
        status: statusFilter,
        idNumber: searchById,
        name: searchByName,
      });
      flagGetDataEarn.current = false;
      setData(response?.data?.data?.results);
      setTotalRows(response.data.data.total / limit);
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false);
    }
  };
  const onGetEarnAmount = async (id) => getAmountEarn({ id });

  useEffect(() => {
    onGetDriver(currentPage);
  }, [searchByName, searchById, statusFilter, limit, currentPage]);

  useEffect(() => {
    const onFetchDataEarn = async () => {
      if (!isEmpty(data) && flagGetDataEarn.current === false) {
        const request = data.map((item) => onGetEarnAmount(item._id));
        const amountEarns = [];
        await Promise.all(request).then((responseAmountEarns) => {
          responseAmountEarns.map((itemAmountResponse) =>
            amountEarns.push(itemAmountResponse.data)
          );
        });
        const newDataDriver = cloneDeep(data);
        data.map((itemDriver, index) => {
          amountEarns.map((item) => {
            if (itemDriver._id === item.driver_id) {
              newDataDriver[index].earnAmount = 200;
            }
            return null;
          });
          return null;
        });
        setData(newDataDriver);
        flagGetDataEarn.current = true;
      }
    };
    onFetchDataEarn();
  }, [data]);

  const handleChange = (e, type) => {
    if (type === 'name') {
      setSearchByName(e.target.value);
    } else {
      setSearchById(e.target.value);
    }
  };

  return (
    <div>
      <div className="py-6 md:flex flex-row px-10 grid gap-y-4 md:gap-y-0 gap-x-4">
        <div className="w-full max-w-xs">
          <SelectBox
            valueSelect={selectedPersons}
            onRemove={removeItem}
            handleSelection={handleSelection}
            optionData={status}
            isSelected={isSelected}
          />
        </div>
        <div className="w-full max-w-xs  h-11">
          <CustomInput onChange={handleChange} type="name" placeholder="Name driver" />
        </div>
        <div className="w-full max-w-xs h-11">
          <CustomInput onChange={handleChange} type="id" placeholder="Id driver" />
        </div>
      </div>
      <div className="mt-4">
        <TableData
          expandableRows
          // eslint-disable-next-line react/no-unstable-nested-components
          expandableRowsComponent={({ data }) => <ExpandableRowsComponent data={data} />}
          columns={columnsTableDriver}
          data={data}
          isLoading={isLoading}
          selectableRows
          pagination
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
        />
      </div>
    </div>
  );
}
