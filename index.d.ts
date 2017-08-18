// tslint:disable
// graphql typescript definitions

declare namespace Auth {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    message: string;            // Required for all errors
    locations?: Array<IGraphQLResponseErrorLocation>;
    [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  /*
    description: The root query type, home of all queries.
  */
  interface IQuery {
    __typename: string;
    user: IUser | null;
    search_user: Array<IUser>;
    authenticate: string;
    logout: string;
  }

  /*
    description: 
  */
  type Auth = IQuery;

  /*
    description: 
  */
  interface IAuth {
    __typename: string;
    user: IUser | null;
    authenticate: string;
    logout: string;
  }

  /*
    description: The basic user type
  */
  interface IUser {
    __typename: string;
    id: string;
    email: string;
    email_verified: boolean;
    admin: boolean;
    name: string | null;
  }

  /*
    description: The root mutation type, home of all mutations.
  */
  interface IMutation {
    __typename: string;
    is_admin: boolean | null;
  }
}

// tslint:enable
