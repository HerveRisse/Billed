/**
 * @jest-environment jsdom
*/

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom/extend-expect';


import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon")
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills })
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
    /* ----------------------------------------------------------------*/

    // test d'intégration GET
    describe("When I am on Bills Page", () => {
        test("Then the bills should be fetched", async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            const tableContainer = await waitFor(() => screen.getByTestId("tbody"));
            expect(tableContainer).toBeTruthy();
            const rows = screen.getAllByRole("row", { container: tableContainer });
            expect(rows).toHaveLength(5);
        });
    });

    describe("When I am on Bills Page", () => {
        test("Then the clickable button should be present on the page", async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)

            const newBillBtn = await waitFor(() => screen.getByTestId('btn-new-bill'))
            expect(newBillBtn).toBeVisible();

            const eyeIcons = await waitFor(() => screen.getAllByTestId('icon-eye'))
            eyeIcons.forEach((eyeIcon) => {
                expect(eyeIcon).toBeVisible();
            });
        })
    })

    describe('When I click on Nouvelle note de frais', () => {
        test('Then i should be sent on the newBill page', () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = BillsUI(bills)
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const store = null
          const myBills = new Bills({
            document, onNavigate, store, bills, localStorage: window.localStorage
          })
          const newBillBtn = screen.getByTestId("btn-new-bill")
          const handleClickNewBill = jest.fn(() => myBills.handleClickNewBill())
          newBillBtn.addEventListener("click", handleClickNewBill)
          fireEvent.click(newBillBtn)
          expect(handleClickNewBill).toHaveBeenCalled()
          const newBillForm = screen.queryByTestId("form-new-bill")
          expect(newBillForm).toBeTruthy()
        })
    })
    
    describe('When I click on the icon eye', () => {
        test('A modal should open', async () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = BillsUI(bills)
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const store = null
          const myBills = new Bills({
            document, onNavigate, store, bills, localStorage: window.localStorage
          })

          const handleClickIconEye = jest.fn((eyeIcon) => myBills.handleClickIconEye(eyeIcon))
          const eyeIcons = await waitFor(() => screen.getAllByTestId('icon-eye'));
          eyeIcons.forEach((eyeIcon) => {
            eyeIcon.addEventListener('click', handleClickIconEye(eyeIcon))
            userEvent.click(eyeIcon)
            expect(handleClickIconEye).toHaveBeenCalled()
          });

          const modale = screen.getByTestId('modaleFileEmployee')
          expect(modale).toBeTruthy()
          expect(modale).toBeVisible()
        })
    })
    
})