CREATE TABLE CLIENTES (
    Cedula INT PRIMARY KEY,
    Nombres VARCHAR(50) NOT NULL,
    Apellidos VARCHAR(50) NOT NULL,
    Direccion VARCHAR(100),
    FechaNacimiento DATE,
    Genero CHAR(1),
    Celular VARCHAR(15),
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE VEHICULOS (
    NumeroMotor VARCHAR(50) PRIMARY KEY,
    Modelo VARCHAR(50) NOT NULL,
    Cilindraje INT,
    Color VARCHAR(20),
    FechaEnsamble DATE,
    AnioModelo INT
);

CREATE TABLE VENDEDOR (
    VendedorID INT PRIMARY KEY,
    Nombre VARCHAR(50),
    Apellido VARCHAR(50),
    Celular VARCHAR(15),
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE VENTAS (
    NumeroFactura INT PRIMARY KEY,
    Fecha DATE,
    Ciudad VARCHAR(50),
    Tienda VARCHAR(50),
    Precio DECIMAL(10, 2),
    NumeroMotor VARCHAR(50),
    VendedorID INT,
    ClienteCedula INT,
    FOREIGN KEY (NumeroMotor) REFERENCES VEHICULOS(NumeroMotor),
    FOREIGN KEY (VendedorID) REFERENCES VENDEDOR(VendedorID),
    FOREIGN KEY (ClienteCedula) REFERENCES CLIENTES(Cedula)
);

CREATE INDEX idx_clientes_cedula ON CLIENTES (Cedula);
CREATE INDEX idx_vehiculos_num_motor ON VEHICULOS (NumeroMotor);
CREATE INDEX idx_vendedor_nombre ON VENDEDOR (Nombre);
CREATE INDEX idx_vendedor_apellido ON VENDEDOR (Apellido);