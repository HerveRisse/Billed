/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I navigate to NewBill Page", () => {
        test("Then the form should be visible", () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.NewBill);
            
            const formNewBill = screen.getByTestId("form-new-bill");
            expect(formNewBill).toBeTruthy();

        })
    })
    describe("When i am on the NewBill Page",() => {
        test("Then the form field should be visible",() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))

            const html = NewBillUI()
            document.body.innerHTML = html

            const expenseType = screen.getByTestId("expense-type");
            expect(expenseType).toBeTruthy();

            const expenseName = screen.getByTestId("expense-name");
            expect(expenseName).toBeTruthy();

            const amount = screen.getByTestId("amount");
            expect(amount).toBeTruthy();

            const datePicker = screen.getByTestId("datepicker");
            expect(datePicker).toBeTruthy();

            const vat = screen.getByTestId("vat");
            expect(vat).toBeTruthy();

            const pct = screen.getByTestId("pct");
            expect(pct).toBeTruthy();

            const commentary = screen.getByTestId("commentary");
            expect(commentary).toBeTruthy();

            const fileField = screen.getByTestId("file");
            expect(fileField).toBeTruthy();

        })
    })
    describe("When i am on the NewBill Page with all fields correctly filled in and click on the submit button",() => {
        test("Then the submit button should be called and i should be redirected on the Bill page",() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))

            const html = NewBillUI()
            document.body.innerHTML = html

            function onNavigate(pathname) {
                document.body.innerHTML = ROUTES({pathname})
            }

            const containerNewBill = new NewBill({document, onNavigate, store: mockedBills, localStorage})

            const expenseType = screen.getByTestId("expense-type");
            fireEvent.change(expenseType, { target: { value: bills[1].type } })

            const expenseName = screen.getByTestId("expense-name");
            fireEvent.change(expenseName,{ target: { value: bills[1].name} })

            const amount = screen.getByTestId("amount");
            fireEvent.change(amount,{ target: { value: bills[1].amount } })

            const datePicker = screen.getByTestId("datepicker");
            fireEvent.change(datePicker,{ target: { value: bills[1].date } })

            const vat = screen.getByTestId("vat");
            fireEvent.change(vat,{ target: { value: bills[1].vat } })

            const pct = screen.getByTestId("pct");
            fireEvent.change(pct,{ target: { value: bills[1].pct } })

            const commentary = screen.getByTestId("commentary");
            fireEvent.change(commentary,{ target: { value: bills[1].commentary } })

            expect(expenseType.validity.valueMissing).toBeFalsy();
            expect(expenseName.validity.valueMissing).toBeFalsy();
            expect(datePicker.validity.valueMissing).toBeFalsy();
            expect(amount.validity.valueMissing).toBeFalsy();
            expect(pct.validity.valueMissing).toBeFalsy();
            expect(commentary.validity.valueMissing).toBeFalsy();

            const file = screen.getByTestId("file")
            const newFile = new File(["image/jpeg"], bills[1].fileName, {
                type: "image/jpeg",
            });
            
            const handleChangeFile = jest.spyOn(containerNewBill, "handleChangeFile");
            file.addEventListener("change", handleChangeFile)

            const fileValidation = jest.spyOn(containerNewBill, "fileValidation");
            file.addEventListener("change", fileValidation)

            fireEvent.change(file, {
                target: { 
                    files: [newFile] },
            })
            
            expect(handleChangeFile).toHaveBeenCalledTimes(1);
            expect(fileValidation).toHaveBeenCalledTimes(1);

            expect(fileValidation(newFile)).toBeTruthy();
            expect(file.outerHTML).not.toContain('is-invalid');           

            const formNewBill = screen.getByTestId("form-new-bill");
            const handleSubmitForm = jest.fn(containerNewBill.handleSubmit)
            formNewBill.addEventListener("submit", handleSubmitForm)
            
            const submitButton = screen.getByTestId("btn-send-bill");
            expect(submitButton).toBeTruthy();
            expect(submitButton.type).toBe("submit");
            fireEvent.click(submitButton);

            expect(handleSubmitForm).toHaveBeenCalled(); 

            const billPage = screen.getByTestId("tbody");
            expect(billPage).toBeTruthy();
        })
    })
})