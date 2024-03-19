import { Page } from '@playwright/test';
import 'dotenv/config';

export class ApiHelper {
    readonly page: Page;
    readonly urlHiveNodeApi: string;
    readonly urlBackendAPI: string;

    constructor(page: Page) {
        this.page = page;
        this.urlHiveNodeApi = process.env.REACT_APP_HIVE_BLOG_API_ADDRESS || '';
        this.urlBackendAPI = process.env.REACT_APP_API_ADDRESS || '';
    }

    // Get witnesses by databaseapi list_witnesses
    async getWitnessesDatabaseApi(startAccount: string) {
        const responseGetWitnesses = await this.page.request.post(`${this.urlHiveNodeApi}/`, {
            data: {
                id: 1,
                jsonrpc: '2.0',
                method: 'database_api.list_witnesses',
                params: {"start": startAccount, "limit":1, "order":"by_name"}
                },
            headers: {
                Accept: 'application/json, text/plain, */*'
            }
        });

        return responseGetWitnesses.json();
    }

    // Get top 21 witnesses by vote
    async getWitnessesByVote() {
        const responseGetWitnesses = await this.page.request.post(`${this.urlHiveNodeApi}/`, {
            data: {
               id: 1,
               jsonrpc: '2.0',
               method: 'condenser_api.get_witnesses_by_vote',
               params: [null, 21]
             },
            headers: {
              Accept: 'application/json, text/plain, */*'
            }
        });

        return responseGetWitnesses.json();
    }

    // Get witnesses by account name
    async getWitnessesByAccount(account: string) {
        const responseGetWitness = await this.page.request.post(`${this.urlHiveNodeApi}`, {
            data: {
                id: 1,
                jsonrpc: '2.0',
                method: 'condenser_api.get_witness_by_account',
                params: [account]
                },
            headers: {
                Accept: 'application/json, text/plain, */*'
            }
        });

        return responseGetWitness.json();
    }

    // Get witnesses by hafbe rpc/get_witnesses
    async getWitnessesByHafbe() {
        const responseGetWitness = await this.page.request.post(`${this.urlBackendAPI}/get_witnesses`, {
            data: {
                "_limit":200,
                "_offset":0,
                "_order_by":"votes",
                "_order_is":"desc"
            },
            headers: {
                Accept: 'application/json, text/plain, */*'
            }
        });

        return responseGetWitness.json();
    }

}
