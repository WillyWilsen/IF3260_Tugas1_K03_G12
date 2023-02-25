class ConvexHull {
    vertexes = [];
    color = [];

    constructor(vertexes, color) {
        const vertexes_matrix = this.convertVertexArrayToMatrix(vertexes);
        const color_matrix = this.convertColorArrayToMatrix(color);
        const vertexes_index = this.FullConvex(vertexes_matrix);
        this.convertVertexHullToValue(vertexes_index, vertexes_matrix, color_matrix);
    }

    // INPUT
    convertVertexArrayToMatrix(vertexes) {
        const vertexes_matrix = [];
        for (let i = 0; i < vertexes.length; i += 2) {
            vertexes_matrix.push([vertexes[i], vertexes[i + 1]]);
        }
        return vertexes_matrix;
    }

    convertColorArrayToMatrix(color) {
        const color_matrix = [];
        for (let i = 0; i < color.length; i += 3) {
            color_matrix.push([color[i], color[i + 1], color[i + 2]]);
        }
        return color_matrix;
    }

    // OUTPUT
    convertVertexHullToValue(vertexes_index, vertexes_matrix, color_matrix) {
        let vertex_idx_corelation;
        while (vertexes_index.length > 0) {
            if (this.vertexes.length > 0) {
                for (let i = 0; i < vertexes_index.length; i++) {
                    if (vertexes_index[i][0] === vertex_idx_corelation) {
                        vertex_idx_corelation = vertexes_index[i][1];
                        this.vertexes.push(vertexes_matrix[vertex_idx_corelation][0], vertexes_matrix[vertex_idx_corelation][1]);
                        this.color.push(color_matrix[vertex_idx_corelation][0], color_matrix[vertex_idx_corelation][1], color_matrix[vertex_idx_corelation][2]);
                        vertexes_index.splice(i, 1);
                        break
                    } else {
                        if (vertexes_index[i][1] === vertex_idx_corelation) {
                            vertex_idx_corelation = vertexes_index[i][0];
                            this.vertexes.push(vertexes_matrix[vertex_idx_corelation][0], vertexes_matrix[vertex_idx_corelation][1]);
                            this.color.push(color_matrix[vertex_idx_corelation][0], color_matrix[vertex_idx_corelation][1], color_matrix[vertex_idx_corelation][2]);
                            vertexes_index.splice(i, 1);
                            break
                        }
                    }
                }
            } else {
                vertex_idx_corelation = vertexes_index[0][0];
                this.vertexes.push(vertexes_matrix[vertex_idx_corelation][0], vertexes_matrix[vertex_idx_corelation][1]);
                this.color.push(color_matrix[vertex_idx_corelation][0], color_matrix[vertex_idx_corelation][1], color_matrix[vertex_idx_corelation][2]);
                vertexes_index.splice(0, 1);
            }
        }
    }


    // FUNCTION
    extreme(M) {
        const T = [];
        let minimum = 0;
        let maksimum = 0;

        for (let i = 1; i < M.length; i++) {
            if (M[i][0] < M[minimum][0] || (M[i][0] == M[minimum][0] && M[i][1] < M[minimum][1])) {
                minimum = i;
            }
            if (M[i][0] > M[maksimum][0] || (M[i][0] == M[maksimum][0] && M[i][1] < M[maksimum][1])) {
                maksimum = i;
            }
        }
        T.push(minimum);
        T.push(maksimum);
        return T;
    }

    determinan(p1,p2,array) {
        if ((p1[0] == p2[0] && p1[0] == array[0]) || (p1[1] == p2[1] && p1[1] == array[1])) {
            return 0;
        }
        return (p1[0]*p2[1] + array[0]*p1[1] + p2[0]*array[1] - array[0]*p2[1] - p2[0]*p1[1] - p1[0]*array[1]);
    }

    leftPoints(p1,p2,M,left) {
        const T = [];

        for (let i = 0; i < M.length; i++) {
            if (p1 != i && p2 != i) {
                const det = this.determinan(M[p1],M[p2],M[i]);
                if (left) {
                    if (det > 0) {
                        T.push(i);
                    }
                }
                else {
                    if (det < 0) {
                        T.push(i);
                    }
                }
            }
        }
        return T;
    }

    distance(p1,p2,M,p3) {
        const a = M[p1][1] - M[p2][1];
        const b = M[p2][0] - M[p1][0];
        const c = M[p1][0]*M[p2][1] - M[p2][0]*M[p1][1];

        const jarak = Math.abs((a*M[p3][0] + b*M[p3][1] + c)/((a**2 + b**2)**0.5));
        return jarak;
    }

    maxDistance(p1,p2,points,M) {
        let maksimum = points[0];

        for (let i = 0; i < points.length; i++) {
            const jarak = this.distance(p1,p2,M,points[i]);
            if (jarak > this.distance(p1,p2,M,maksimum)) {
                maksimum = points[i];
            }
        }
        return maksimum;
    }

    ConvexLeft(p1,p2,M,left) {
        const T = [];

        if (left) {
            const leftpoints = this.leftPoints(p1,p2,M,true);
            if (leftpoints.length === 0) {
                T.push([p1,p2]);
            }
            else {
                const p3 = this.maxDistance(p1,p2,leftpoints,M);
                const T1 = this.ConvexLeft(p1,p3,M,true);
                const T2 = this.ConvexLeft(p3,p2,M,true);
                T.push(...T1);
                T.push(...T2);
            }
        }
        else {
            const rightpoints = this.leftPoints(p1,p2,M,false)
            if (rightpoints.length === 0) {
                T.push([p1,p2]);
            }
            else {
                const p3 = this.maxDistance(p1,p2,rightpoints,M);
                const T1 = this.ConvexLeft(p1,p3,M,false);
                const T2 = this.ConvexLeft(p3,p2,M,false);
                T.push(...T1);
                T.push(...T2);
            }
        }
        return T;
    }

    FullConvex(M) {
        const Hasil = [];

        const p1 = this.extreme(M)[0];
        const pn = this.extreme(M)[1];
        const Hasil1 = this.ConvexLeft(p1,pn,M,true);
        const Hasil2 = this.ConvexLeft(p1,pn,M,false);

        Hasil.push(...Hasil1);
        Hasil.push(...Hasil2);
        return Hasil;
    }
}